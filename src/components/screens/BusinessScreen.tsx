import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Receipt,
  Users,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Wallet,
  Search,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  Building,
  FileText,
  Download,
  UserPlus,
  CreditCard,
  Layers,
  Tag,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { ReconciliationInbox } from '../business/ReconciliationInbox';
import { TraceabilityModal } from '../business/TraceabilityModal';
import { RecordSaleModal } from '../business/RecordSaleModal';
import { RecordPurchaseModal } from '../business/RecordPurchaseModal';
import { RecordExpenseModal } from '../business/RecordExpenseModal';
import { RecordPaymentModal } from '../business/RecordPaymentModal';
import { AddCustomerModal } from '../business/AddCustomerModal';
import { AddSupplierModal } from '../business/AddSupplierModal';
import { CashManagementModal } from '../business/CashManagementModal';
import { InventoryMovementModal } from '../business/InventoryMovementModal';
import { BusinessTypeModal } from '../business/BusinessTypeModal';
import { CurrencyWaveVector, SecurityPatternVector, CardFlowVector } from '../common/UiVectors';

export const BusinessScreen: React.FC = () => {
  const {
    business,
    businessMembers,
    businessMetrics,
    businessSales,
    businessPurchases,
    businessExpenses,
    customers,
    suppliers,
    products,
    movements,
    transactions,
    accounts,
    cashOnHand,
    auditTrail,
    dateRange,
    deriveStock,
    deriveCustBalance,
    deriveSupBalance,
    openDetail,
    refreshAccount,
    isSyncing,
    currentScreen,
    setCurrentScreen
  } = useFinancial();

  // Active sub-tab in Business space (Section 3: Business Navigation)
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'review'
    | 'sales'
    | 'inventory'
    | 'expenses'
    | 'customers'
    | 'suppliers'
    | 'receivables'
    | 'payables'
    | 'reports'
    | 'settings'
  >('overview');

  // Modals state for the 7 primary business actions
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [isRecordPurchaseOpen, setIsRecordPurchaseOpen] = useState(false);
  const [isRecordExpenseOpen, setIsRecordExpenseOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [recordPaymentDefaultType, setRecordPaymentDefaultType] = useState<'customer' | 'supplier' | 'owner'>('customer');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashModalMode, setCashModalMode] = useState<'sale' | 'expense'>('sale');
  const [isInventoryMovementOpen, setIsInventoryMovementOpen] = useState(false);
  const [isBusinessTypeModalOpen, setIsBusinessTypeModalOpen] = useState(false);

  // Progressive disclosure menu for secondary business actions
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Traceability drill-down modal (Section 21)
  const [traceabilityMetric, setTraceabilityMetric] = useState<
    'revenue' | 'expenses' | 'cogs' | 'profit' | 'receivables' | 'payables' | 'inventory' | 'cash' | null
  >(null);

  // Reports export state
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Audit trail search filter
  const [auditFilter, setAuditFilter] = useState('');

  // Review count
  const pendingReviewCount = businessMetrics.needsReviewCount;

  // Connected business accounts
  const bizAccounts = accounts.filter(a => a.isBusiness && a.type !== 'card');
  const totalBankBalances = bizAccounts.reduce((sum, a) => sum + a.balance, 0);

  const handleDownload = (format: 'PDF' | 'Excel' | 'CSV') => {
    const filename = `CashDeck_Business_Statement_${new Date().toISOString().split('T')[0]}.${format === 'Excel' ? 'xlsx' : format.toLowerCase()}`;
    const dummyContent = format === 'CSV'
      ? `Report,CashDeck Business Financial Statement\nDate Range,${dateRange}\nRevenue,${businessMetrics.revenue}\nCost of Goods Sold,${businessMetrics.costOfGoodsSold}\nGross Profit,${businessMetrics.grossProfit}\nOperating Expenses,${businessMetrics.operatingExpenses}\nNet Profit,${businessMetrics.netProfit}\nMargin,${businessMetrics.profitMargin}%\nTotal Receivables,${businessMetrics.totalReceivables}\nTotal Payables,${businessMetrics.totalPayables}\n`
      : `CashDeck Business Statement - ${dateRange}\nBusiness: ${business.name} (${business.business_type})\nRevenue: ₦${businessMetrics.revenue.toLocaleString()}\nNet Profit: ₦${businessMetrics.netProfit.toLocaleString()}\nCash Position: ₦${businessMetrics.totalBusinessCash.toLocaleString()}`;

    const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(format);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & BUSINESS TYPE CONTEXT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBusinessTypeModalOpen(true)}
              className="px-2.5 py-0.5 rounded-md bg-emerald-100/90 hover:bg-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>{business.name} ({business.business_type})</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-800" />
            </button>
            <span className="text-[11px] text-slate-400 font-medium">Business Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Financial & Operations Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Connected bank transactions, inventory movements, sales, receivables, and payables.
          </p>
        </div>

        {/* Primary Actions Row with Progressive Disclosure (Section 3: The 7 most important actions) */}
        <div className="flex items-center gap-2 flex-wrap relative">
          {/* Action 1: Record Sale */}
          <button
            onClick={() => setIsRecordSaleOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Sale</span>
          </button>

          {/* Action 2: Record Payment */}
          <button
            onClick={() => {
              setRecordPaymentDefaultType('customer');
              setIsRecordPaymentOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
            <span>Record Payment</span>
          </button>

          {/* Action 3: Add Expense */}
          <button
            onClick={() => setIsRecordExpenseOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Expense</span>
          </button>

          {/* Action 4: Record Purchase */}
          <button
            onClick={() => setIsRecordPurchaseOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Truck className="w-3.5 h-3.5 text-slate-500" />
            <span>Record Purchase</span>
          </button>

          {/* Action 5: Add Stock */}
          <button
            onClick={() => setIsInventoryMovementOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Package className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Stock</span>
          </button>

          {/* Action 6 & 7 + Overflow: Progressive Disclosure Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoreActions(prev => !prev)}
              className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <span>+ Actions</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showMoreActions && (
              <div
                onClick={() => setShowMoreActions(false)}
                className="fixed inset-0 z-30"
              />
            )}

            {showMoreActions && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-1.5 z-40 text-xs font-semibold divide-y divide-slate-100 animate-in fade-in zoom-in-95">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsInventoryMovementOpen(true);
                      setShowMoreActions(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Package className="w-4 h-4 text-emerald-600" />
                    <span>Add Stock / Audit</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsRecordPurchaseOpen(true);
                      setShowMoreActions(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Truck className="w-4 h-4 text-slate-600" />
                    <span>Record Purchase Order</span>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsAddCustomerOpen(true);
                      setShowMoreActions(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    <span>Add Customer</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAddSupplierOpen(true);
                      setShowMoreActions(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Truck className="w-4 h-4 text-slate-600" />
                    <span>Add Supplier</span>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setCashModalMode('sale');
                      setIsCashModalOpen(true);
                      setShowMoreActions(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-emerald-800"
                  >
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>Record Physical Cash Sale</span>
                  </button>
                  <button
                    onClick={() => {
                      setCashModalMode('expense');
                      setIsCashModalOpen(true);
                      setShowMoreActions(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-rose-700"
                  >
                    <Receipt className="w-4 h-4 text-rose-600" />
                    <span>Record Physical Cash Expense</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. BUSINESS NAVIGATION STRIP WITH PROGRESSIVE DISCLOSURE (Section 3) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/60">
        {[
          { id: 'overview', label: 'Overview', icon: Building, badge: null },
          {
            id: 'review',
            label: 'Transactions / Review',
            icon: Layers,
            badge: pendingReviewCount > 0 ? pendingReviewCount : null
          },
          { id: 'sales', label: 'Sales', icon: ShoppingBag, badge: null },
          { id: 'inventory', label: 'Inventory', icon: Package, badge: businessMetrics.lowStockCount > 0 ? `${businessMetrics.lowStockCount} Low` : null },
          { id: 'expenses', label: 'Expenses', icon: Receipt, badge: null },
          { id: 'receivables', label: 'Receivables', icon: ArrowDownLeft, badge: businessMetrics.totalReceivables > 0 ? `₦${(businessMetrics.totalReceivables / 1000).toFixed(0)}k` : null },
          { id: 'payables', label: 'Payables', icon: ArrowUpRight, badge: businessMetrics.totalPayables > 0 ? `₦${(businessMetrics.totalPayables / 1000).toFixed(0)}k` : null },
          { id: 'customers', label: 'Customers', icon: Users, badge: null },
          { id: 'suppliers', label: 'Suppliers', icon: Truck, badge: null },
          { id: 'reports', label: 'Reports', icon: FileText, badge: null },
          { id: 'settings', label: 'Settings', icon: SlidersHorizontal, badge: null }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. RECONCILIATION INBOX TAB VIEW */}
      {activeTab === 'review' && <ReconciliationInbox />}

      {/* 4. OVERVIEW DASHBOARD VIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* SECTION 4: CASH POSITION CARD */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 lg:p-7 border border-slate-200/70 shadow-xs relative overflow-hidden">
            {/* Subtle fintech vector watermarks */}
            <div className="absolute right-0 bottom-0 w-80 h-28 pointer-events-none opacity-25 hidden sm:block">
              <CurrencyWaveVector className="text-emerald-700" />
            </div>
            <div className="absolute right-12 -top-10 w-44 h-44 pointer-events-none opacity-10 hidden md:block">
              <SecurityPatternVector className="text-emerald-900" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Business Cash Position
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                    ₦{businessMetrics.totalBusinessCash.toLocaleString()}
                  </span>
                  <button
                    onClick={() => setTraceabilityMetric('cash')}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5"
                  >
                    <span>Why this number?</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Sync status & fast cash actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Bank feeds updated just now</span>
                  <button
                    onClick={() => refreshAccount('all')}
                    disabled={isSyncing}
                    className="ml-1 text-slate-600 hover:text-slate-900 p-0.5"
                    title="Refresh bank accounts"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setCashModalMode('sale');
                    setIsCashModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold border border-emerald-200/80 transition-colors"
                >
                  + Cash Sale
                </button>
                <button
                  onClick={() => {
                    setCashModalMode('expense');
                    setIsCashModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
                >
                  − Cash Expense
                </button>
              </div>
            </div>

            {/* Cash Sub-breakdown: Bank balances vs Physical cash */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-150">
                <span className="text-slate-400 font-medium block">Connected Business Banks</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  ₦{totalBankBalances.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500">Across GTBank & Access business accounts</span>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-150">
                <span className="text-slate-400 font-medium block">Physical Cash on Hand</span>
                <span className="text-lg font-bold text-emerald-900 mt-0.5 block">
                  ₦{cashOnHand.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500">Derived from cash sales minus cash expenses</span>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-150">
                <span className="text-slate-400 font-medium block">Liquid Net Cash Flow</span>
                <span className={`text-lg font-bold mt-0.5 block ${businessMetrics.netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {businessMetrics.netCashFlow >= 0 ? '+' : ''}₦{businessMetrics.netCashFlow.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500">₦{businessMetrics.cashInflow.toLocaleString()} in • ₦{businessMetrics.cashOutflow.toLocaleString()} out</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: THIS PERIOD METRICS (100% Traceable) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                This Period Financial Performance ({dateRange})
              </h3>
              <span className="text-[11px] text-slate-400">Tap any number to view underlying transactions</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {/* Revenue */}
              <div
                onClick={() => setTraceabilityMetric('revenue')}
                className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-xs hover:border-emerald-500 cursor-pointer group transition-all"
              >
                <div className="absolute -right-3 -top-2 w-28 h-20 pointer-events-none opacity-40">
                  <CardFlowVector className="text-emerald-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center text-slate-400 text-xs">
                    <span className="font-semibold group-hover:text-slate-900">Revenue</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 mt-1 truncate">
                    ₦{businessMetrics.revenue.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                    {businessMetrics.salesCount} sales included →
                  </span>
                </div>
              </div>

              {/* Operating Expenses */}
              <div
                onClick={() => setTraceabilityMetric('expenses')}
                className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-xs hover:border-rose-500 cursor-pointer group transition-all"
              >
                <div className="absolute -right-3 -top-2 w-28 h-20 pointer-events-none opacity-40">
                  <CardFlowVector className="text-rose-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center text-slate-400 text-xs">
                    <span className="font-semibold group-hover:text-slate-900">Operating Expenses</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 mt-1 truncate">
                    ₦{businessMetrics.operatingExpenses.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    {businessMetrics.expensesCount} business expenses →
                  </span>
                </div>
              </div>

              {/* Gross Profit */}
              <div
                onClick={() => setTraceabilityMetric('cogs')}
                className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-xs hover:border-emerald-500 cursor-pointer group transition-all"
              >
                <div className="absolute -right-3 -top-2 w-28 h-20 pointer-events-none opacity-40">
                  <CardFlowVector className="text-emerald-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center text-slate-400 text-xs">
                    <span className="font-semibold group-hover:text-slate-900">Gross Profit</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-800 mt-1 truncate">
                    ₦{businessMetrics.grossProfit.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    COGS: ₦{businessMetrics.costOfGoodsSold.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Net Profit */}
              <div
                onClick={() => setTraceabilityMetric('profit')}
                className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-xs hover:border-emerald-500 cursor-pointer group transition-all"
              >
                <div className="absolute -right-3 -top-2 w-28 h-20 pointer-events-none opacity-40">
                  <CardFlowVector className="text-emerald-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center text-slate-400 text-xs">
                    <span className="font-semibold group-hover:text-slate-900">Net Profit</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className={`text-xl sm:text-2xl lg:text-3xl font-extrabold mt-1 truncate ${businessMetrics.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    ₦{businessMetrics.netProfit.toLocaleString()}
                  </p>
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                    Margin: {businessMetrics.profitMargin}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: MONEY COMING IN & MONEY GOING OUT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Money Coming In */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Money Coming In</h4>
                    <span className="text-[11px] text-slate-500">Customer debts & receivables</span>
                  </div>
                </div>
                <button
                  onClick={() => setTraceabilityMetric('receivables')}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center"
                >
                  <span>₦{businessMetrics.totalReceivables.toLocaleString()}</span>
                  <ChevronRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {customers
                  .filter(c => c.amountOwed > 0)
                  .map(cust => (
                    <div key={cust.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{cust.name}</span>
                        <span className="text-[11px] text-slate-500 block">{cust.phone}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-800">₦{cust.amountOwed.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 block">{cust.status}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Money Going Out */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Money Going Out</h4>
                    <span className="text-[11px] text-slate-500">Supplier payables & pending bills</span>
                  </div>
                </div>
                <button
                  onClick={() => setTraceabilityMetric('payables')}
                  className="text-xs font-bold text-rose-800 hover:text-rose-950 flex items-center"
                >
                  <span>₦{businessMetrics.totalPayables.toLocaleString()}</span>
                  <ChevronRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {suppliers
                  .filter(s => s.amountOwed > 0)
                  .map(sup => (
                    <div key={sup.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{sup.name}</span>
                        <span className="text-[11px] text-slate-500 block">{sup.contactPerson}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-rose-700">₦{sup.amountOwed.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 block">Due Settlement</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: INVENTORY VALUATION & REORDER THRESHOLDS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Inventory Status (Movement-Derived)</h4>
                  <p className="text-[11px] text-slate-500">True physical count derived from purchases, sales & audits.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-900">
                  Total Valuation: ₦{businessMetrics.totalInventoryValue.toLocaleString()}
                </span>
                <button
                  onClick={() => setIsInventoryMovementOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                >
                  + Stock Audit Movement
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {products.slice(0, 6).map(prod => {
                const stock = deriveStock(prod.id);
                const isLow = stock > 0 && stock <= prod.reorder_level;
                const isOut = stock <= 0;
                return (
                  <div key={prod.id} className="p-3 bg-slate-50/70 rounded-2xl border border-slate-200/70 space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span className="truncate pr-1">{prod.name}</span>
                      <span className={isOut ? 'text-rose-700' : isLow ? 'text-amber-700' : 'text-slate-900'}>
                        {stock} units
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>SKU: {prod.sku}</span>
                      <span>₦{prod.selling_price.toLocaleString()}</span>
                    </div>
                    {isLow && (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        ⚠ Low Stock (Reorder ≤ {prod.reorder_level})
                      </span>
                    )}
                    {isOut && (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900">
                        ✕ Out of Stock
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: "NEEDS ATTENTION" ACTION PANEL */}
          {(pendingReviewCount > 0 || businessMetrics.lowStockCount > 0 || businessMetrics.totalReceivables > 0) && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Needs Attention</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {pendingReviewCount > 0 && (
                  <div
                    onClick={() => setActiveTab('review')}
                    className="p-3 bg-white rounded-2xl border border-amber-200/80 shadow-2xs hover:border-amber-400 cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-slate-900 block">{pendingReviewCount} Transactions to Review</span>
                    <span className="text-[11px] text-slate-500">Unclassified bank inflows & candidate matches</span>
                  </div>
                )}
                {businessMetrics.lowStockCount > 0 && (
                  <div
                    onClick={() => setActiveTab('inventory')}
                    className="p-3 bg-white rounded-2xl border border-amber-200/80 shadow-2xs hover:border-amber-400 cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-slate-900 block">{businessMetrics.lowStockCount} Products Need Restocking</span>
                    <span className="text-[11px] text-slate-500">Below minimum replenishment threshold</span>
                  </div>
                )}
                {businessMetrics.totalReceivables > 0 && (
                  <div
                    onClick={() => setActiveTab('receivables')}
                    className="p-3 bg-white rounded-2xl border border-amber-200/80 shadow-2xs hover:border-amber-400 cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-slate-900 block">₦{businessMetrics.totalReceivables.toLocaleString()} Uncollected Debts</span>
                    <span className="text-[11px] text-slate-500">Customers with pending balances</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. SALES SUB-VIEW */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Sales Ledger</h3>
              <p className="text-xs text-slate-500">All customer sales, credit terms, and item lines.</p>
            </div>
            <button
              onClick={() => setIsRecordSaleOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Record Sale</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-400 font-semibold border-b border-slate-100">
                    <th className="py-3 px-4">Sale #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-right">Paid</th>
                    <th className="py-3 px-4 text-right">Owed</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {businessSales.map(sale => (
                    <tr key={sale.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">#{sale.sale_number}</td>
                      <td className="py-3 px-4 text-slate-500">{sale.sale_date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{sale.customer_name || 'Walk-in'}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {sale.items.map(i => `${i.product_name} (×${i.quantity})`).join(', ')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">₦{sale.total.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-semibold">₦{sale.paid_amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-amber-800 font-semibold">₦{sale.outstanding_amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sale.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sale.status === 'partially_paid'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {sale.status === 'paid' ? 'Paid' : sale.status === 'partially_paid' ? 'Partial' : 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. INVENTORY SUB-VIEW */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Inventory Management</h3>
              <p className="text-xs text-slate-500">True stock calculated from {movements.length} logged stock movements.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsInventoryMovementOpen(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                + Stock Movement / Audit
              </button>
              <button
                onClick={() => setIsRecordPurchaseOpen(true)}
                className="px-3.5 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                + Restock Purchase
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-400 font-semibold border-b border-slate-100">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4 text-center">Movement-Derived Stock</th>
                    <th className="py-3 px-4 text-right">Cost Price</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-right">Total Value</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(prod => {
                    const stock = deriveStock(prod.id);
                    const isLow = stock > 0 && stock <= prod.reorder_level;
                    const isOut = stock <= 0;
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{prod.name}</td>
                        <td className="py-3 px-4 text-slate-500">{prod.sku}</td>
                        <td className="py-3 px-4 text-center font-bold text-sm text-slate-900">{stock} units</td>
                        <td className="py-3 px-4 text-right text-slate-600">₦{prod.cost_price.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900">₦{prod.selling_price.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-800">
                          ₦{(Math.max(0, stock) * prod.cost_price).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isOut ? 'Out of stock' : isLow ? 'Low stock' : 'In stock'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. EXPENSES SUB-VIEW */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Operating Expenses</h3>
              <p className="text-xs text-slate-500">Audit-ready expenses linked to bank movements or cash.</p>
            </div>
            <button
              onClick={() => setIsRecordExpenseOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100 text-xs">
            {businessExpenses.map(exp => (
              <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{exp.description}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Category: {exp.category_id} • Date: {exp.expense_date} • Method: {exp.payment_method.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-700 text-base block">−₦{exp.amount.toLocaleString()}</span>
                  {exp.transaction_id && (
                    <span className="text-[10px] text-emerald-700 font-semibold">✓ Linked to bank feed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. RECEIVABLES / CUSTOMERS SUB-VIEW */}
      {(activeTab === 'receivables' || activeTab === 'customers') && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Customers & Receivables</h3>
              <p className="text-xs text-slate-500">Live outstanding customer debt ledger derived from sales & payments.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddCustomerOpen(true)}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                + Add Customer
              </button>
              <button
                onClick={() => {
                  setRecordPaymentDefaultType('customer');
                  setIsRecordPaymentOpen(true);
                }}
                className="px-3.5 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                + Record Payment
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customers.map(c => {
              const bal = deriveCustBalance(c.id);
              return (
                <div key={c.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                      <p className="text-[11px] text-slate-500">{c.phone} • {c.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      bal.amountOwed > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {bal.amountOwed > 0 ? `Owes ₦${bal.amountOwed.toLocaleString()}` : 'Settled'}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <span>Lifetime Purchases: ₦{bal.totalPurchased.toLocaleString()}</span>
                    <span>Total Paid: ₦{bal.totalPaid.toLocaleString()}</span>
                  </div>

                  {bal.outstandingSales.length > 0 && (
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <span className="font-semibold text-slate-700">Outstanding Invoices:</span>
                      {bal.outstandingSales.map(s => (
                        <div key={s.id} className="flex justify-between pl-2 border-l-2 border-amber-300">
                          <span>Sale #{s.sale_number} ({s.sale_date})</span>
                          <span className="font-bold text-amber-900">₦{s.outstanding_amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={() => {
                        setRecordPaymentDefaultType('customer');
                        setIsRecordPaymentOpen(true);
                      }}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Receive Payment
                    </button>
                    <button
                      onClick={() => setIsRecordSaleOpen(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      + Sale
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 9. PAYABLES / SUPPLIERS SUB-VIEW */}
      {(activeTab === 'payables' || activeTab === 'suppliers') && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Suppliers & Payables</h3>
              <p className="text-xs text-slate-500">Vendor procurement ledger and pending supplier debt settlements.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddSupplierOpen(true)}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                + Add Supplier
              </button>
              <button
                onClick={() => setIsRecordPurchaseOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                + New Purchase Order
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map(s => {
              const bal = deriveSupBalance(s.id);
              return (
                <div key={s.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{s.name}</h4>
                      <p className="text-[11px] text-slate-500">{s.contactPerson} • {s.phone}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      bal.amountOwed > 0 ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {bal.amountOwed > 0 ? `Payable: ₦${bal.amountOwed.toLocaleString()}` : 'Settled'}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <span>Total Procured: ₦{bal.totalPurchases.toLocaleString()}</span>
                    <span>Total Paid: ₦{bal.totalPaid.toLocaleString()}</span>
                  </div>

                  {bal.outstandingPurchases.length > 0 && (
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <span className="font-semibold text-slate-700">Pending Orders:</span>
                      {bal.outstandingPurchases.map(p => (
                        <div key={p.id} className="flex justify-between pl-2 border-l-2 border-rose-300">
                          <span>Purchase #{p.purchase_number} ({p.purchase_date})</span>
                          <span className="font-bold text-rose-800">₦{p.outstanding_amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={() => {
                        setRecordPaymentDefaultType('supplier');
                        setIsRecordPaymentOpen(true);
                      }}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Settle Supplier Payable
                    </button>
                    <button
                      onClick={() => setIsRecordPurchaseOpen(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      + Purchase
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 10. REPORTS SUB-VIEW (Section 3: Reports) */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Financial Reports & Statements</h3>
              <p className="text-xs text-slate-500">Official Statement of Profit & Loss and Export Engine.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload('PDF')}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleDownload('Excel')}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleDownload('CSV')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Report exported successfully in {downloadSuccess} format.</span>
            </div>
          )}

          {/* Statement of Profit & Loss */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Statement of Profit & Loss ({dateRange})</h4>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                Margin: {businessMetrics.profitMargin}%
              </span>
            </div>

            <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="p-3.5 bg-slate-50 font-bold text-slate-700 flex justify-between">
                <span>Account Flow Category</span>
                <span>Amount (₦)</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Gross Sales Revenue</span>
                  <span className="text-[11px] text-slate-400 block">{businessMetrics.salesCount} customer sales</span>
                </div>
                <span className="font-bold text-emerald-700">+₦{businessMetrics.revenue.toLocaleString()}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Cost of Goods Sold (COGS)</span>
                  <span className="text-[11px] text-slate-400 block">Inventory wholesale cost recognized on sales</span>
                </div>
                <span className="font-bold text-slate-800">−₦{businessMetrics.costOfGoodsSold.toLocaleString()}</span>
              </div>
              <div className="p-3.5 flex justify-between bg-slate-50/60 font-bold">
                <span className="text-slate-900">Gross Operating Profit</span>
                <span className="text-emerald-800">₦{businessMetrics.grossProfit.toLocaleString()}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Operating Expenses</span>
                  <span className="text-[11px] text-slate-400 block">{businessMetrics.expensesCount} operating expenses (Rent, Power, Shipping)</span>
                </div>
                <span className="font-bold text-rose-700">−₦{businessMetrics.operatingExpenses.toLocaleString()}</span>
              </div>
              <div className="p-3.5 flex justify-between bg-emerald-50/50 text-sm font-extrabold">
                <span className="text-emerald-950">Net Operating Profit</span>
                <span className={businessMetrics.netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}>
                  ₦{businessMetrics.netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. SETTINGS SUB-VIEW (Section 3: Settings) */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Business Configuration & Audit Trail</h3>
              <p className="text-xs text-slate-500">Workspace settings, access roles, and immutable operational logs.</p>
            </div>
            <button
              onClick={() => setIsBusinessTypeModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Switch Business Profile / Type
            </button>
          </div>

          {/* Business Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Identity</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Business Name</span>
                  <span className="font-bold text-slate-900">{business.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Operating Model</span>
                  <span className="font-bold text-emerald-800">{business.business_type}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Reporting Currency</span>
                  <span className="font-bold text-slate-900">{business.currency} (Nigerian Naira)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Reconciliation Rules</span>
                  <span className="font-bold text-slate-900">Deterministic First (AI Advisory)</span>
                </div>
              </div>
            </div>

            {/* Team Roles */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Team & Authorized Roles</h4>
              <div className="space-y-2 text-xs">
                {businessMembers.map(member => (
                  <div key={member.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-none">
                    <div>
                      <span className="font-bold text-slate-900 block">{member.user_name || member.user_id}</span>
                      <span className="text-[11px] text-slate-400">Added {member.created_at.split('T')[0]}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 capitalize">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Trail Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Immutable Audit Trail ({auditTrail.length} Events)</h4>
                <p className="text-[11px] text-slate-500">Every stock movement, sale, classification, and payout is traceable.</p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter log..."
                  value={auditFilter}
                  onChange={e => setAuditFilter(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600"
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
              {auditTrail
                .filter(a =>
                  a.new_value.toLowerCase().includes(auditFilter.toLowerCase()) ||
                  a.entity_type.toLowerCase().includes(auditFilter.toLowerCase()) ||
                  a.changed_by.toLowerCase().includes(auditFilter.toLowerCase())
                )
                .map(entry => (
                  <div key={entry.id} className="py-2.5 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-bold">
                          {entry.entity_type}
                        </span>
                        <span className="font-bold text-slate-800">{entry.new_value}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        By {entry.changed_by} • {entry.timestamp || entry.created_at || 'Just now'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {entry.action}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals for Business Operations */}
      <RecordSaleModal
        isOpen={isRecordSaleOpen}
        onClose={() => setIsRecordSaleOpen(false)}
      />
      <RecordPurchaseModal
        isOpen={isRecordPurchaseOpen}
        onClose={() => setIsRecordPurchaseOpen(false)}
      />
      <RecordExpenseModal
        isOpen={isRecordExpenseOpen}
        onClose={() => setIsRecordExpenseOpen(false)}
      />
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        defaultType={recordPaymentDefaultType}
      />
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />
      <AddSupplierModal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
      />
      <CashManagementModal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        defaultMode={cashModalMode}
      />
      <InventoryMovementModal
        isOpen={isInventoryMovementOpen}
        onClose={() => setIsInventoryMovementOpen(false)}
      />
      <BusinessTypeModal
        isOpen={isBusinessTypeModalOpen}
        onClose={() => setIsBusinessTypeModalOpen(false)}
      />
      {traceabilityMetric && (
        <TraceabilityModal
          isOpen={!!traceabilityMetric}
          onClose={() => setTraceabilityMetric(null)}
          metricKey={traceabilityMetric}
        />
      )}
    </div>
  );
};
