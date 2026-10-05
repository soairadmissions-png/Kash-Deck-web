import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Banknote,
  Smartphone,
  CreditCard,
  Package,
  Users,
  Truck,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiV1 } from '../../services/apiV1';
import { RecordDailySalesModal } from '../business/RecordDailySalesModal';
import { CurrencyWaveVector, SecurityPatternVector, CardFlowVector } from '../common/UiVectors';

interface BusinessOverviewProps {
  onNavigate: (screen: string) => void;
  onOpenRecordSale?: () => void;
  onOpenRecordExpense?: () => void;
}

export const BusinessOverview: React.FC<BusinessOverviewProps> = ({
  onNavigate,
  onOpenRecordSale,
  onOpenRecordExpense
}) => {
  const { activeWorkspace } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hideBalances, setHideBalances] = useState(false);
  const [isDailySalesModalOpen, setIsDailySalesModalOpen] = useState(false);

  const loadDashboard = async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const data = await apiV1.getDashboard(activeWorkspace.id);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load business dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [activeWorkspace?.id]);

  const businessName = activeWorkspace?.name || 'My Business';
  const metrics = dashboardData?.metrics || {
    todaySalesMinor: 0,
    revenueMinor: 0,
    expensesMinor: 0,
    profitMinor: 0,
    profitMargin: null,
    cashFlow: { cashInMinor: 0, cashOutMinor: 0, netCashFlowMinor: 0, owedToYouMinor: 0 }
  };

  const isCashier = dashboardData?.userRole === 'cashier';

  const formatNaira = (minor: number | null | undefined) => {
    if (minor === null || minor === undefined) return '—';
    if (hideBalances) return '••••••';
    return `₦${(minor / 100).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const todayEntry = dashboardData?.todaySalesEntry || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Good morning, {businessName}
            </h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {dashboardData?.salesEntryMode === 'daily' ? 'Daily Sales Mode' : 'Itemized Mode'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here's how your business is performing today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setHideBalances(!hideBalances)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-600 shadow-xs transition-colors"
          >
            {hideBalances ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{hideBalances ? 'Show' : 'Hide'}</span>
          </button>

          <button
            onClick={() => setIsDailySalesModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Today's Sales</span>
          </button>

          <button
            onClick={onOpenRecordExpense || (() => onNavigate('expenses'))}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Needs Attention Strip */}
      {dashboardData?.needsAttention && dashboardData.needsAttention.length > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{dashboardData.needsAttention[0]}</span>
          </div>
          <button
            onClick={() => setIsDailySalesModalOpen(true)}
            className="text-xs font-bold text-amber-950 underline hover:no-underline shrink-0"
          >
            Enter today's total →
          </button>
        </div>
      )}

      {/* Setup Checklist (if skipped items exist) */}
      {dashboardData?.checklist && dashboardData.checklist.some((c: any) => !c.completed) && (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Finish Setting Up Your Business Desk</span>
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
            {dashboardData.checklist.map((item: any) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.id === 'first_sale') setIsDailySalesModalOpen(true);
                  else if (item.id === 'add_expense') onNavigate('expenses');
                  else if (item.id === 'connect_account') onNavigate('accounts');
                }}
                className={`p-3 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                  item.completed
                    ? 'bg-white/60 border-emerald-200 text-emerald-900 opacity-60'
                    : 'bg-white border-emerald-300 text-slate-800 font-semibold shadow-2xs hover:shadow-xs'
                }`}
              >
                <span>{item.label}</span>
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 1: Core Business KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Today's Sales */}
        <div
          onClick={() => setIsDailySalesModalOpen(true)}
          className="relative overflow-hidden bg-gradient-to-br from-[#065f46] to-[#047857] text-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
        >
          <div className="absolute right-0 bottom-0 w-32 h-16 pointer-events-none opacity-20">
            <CurrencyWaveVector className="text-emerald-200" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-100">Today's Sales</span>
            <Calendar className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="relative z-10 my-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {formatNaira(metrics.todaySalesMinor)}
            </h3>
          </div>
          <span className="relative z-10 text-[11px] text-emerald-200">
            {todayEntry ? `${todayEntry.transactionCount || 'Daily'} receipt recorded` : 'Tap to enter today'}
          </span>
        </div>

        {/* Revenue This Month */}
        <div
          onClick={() => onNavigate('sales')}
          className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Revenue (Month)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatNaira(metrics.revenueMinor)}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Total recorded sales</span>
        </div>

        {/* Expenses This Month */}
        <div
          onClick={() => onNavigate('expenses')}
          className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Operating Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatNaira(metrics.expensesMinor)}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Inventory, rent, utilities</span>
        </div>

        {/* Operating Profit */}
        <div
          onClick={() => onNavigate('reports')}
          className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Operating Profit</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <h3 className={`text-2xl font-extrabold tracking-tight ${metrics.profitMinor >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatNaira(metrics.profitMinor)}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Revenue minus expenses</span>
        </div>

        {/* Profit Margin */}
        <div
          onClick={() => onNavigate('reports')}
          className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Profit Margin</span>
            <span className="text-xs font-bold text-slate-400">%</span>
          </div>
          <div className="my-1">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {metrics.profitMargin !== null ? `${metrics.profitMargin}%` : '—'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {metrics.profitMargin !== null ? (metrics.profitMargin > 15 ? 'Healthy margin' : 'Tight margin') : 'Needs revenue'}
          </span>
        </div>
      </div>

      {/* SECTION 2: Today's Sales Card & Business AI Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Sales Dedicated Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Today's Daily Sales
              </h3>
              <p className="text-xs text-slate-400">End-of-day register status</p>
            </div>
            <button
              onClick={() => setIsDailySalesModalOpen(true)}
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              {todayEntry ? 'Edit Entry' : '+ Enter Today'}
            </button>
          </div>

          {todayEntry ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400">Total Recorded Today</span>
                <p className="text-3xl font-black text-slate-900 mt-0.5">
                  {formatNaira(todayEntry.totalSalesMinor)}
                </p>
                {todayEntry.transactionCount && (
                  <span className="text-xs text-slate-500 mt-1 block">
                    {todayEntry.transactionCount} transactions recorded
                  </span>
                )}
              </div>

              {/* Method breakdown chips */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div className="p-2.5 bg-slate-50 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Cash</span>
                  <span className="text-xs font-bold text-slate-900">
                    {formatNaira(todayEntry.cashMinor || 0)}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Transfer</span>
                  <span className="text-xs font-bold text-slate-900">
                    {formatNaira(todayEntry.transferMinor || 0)}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">POS</span>
                  <span className="text-xs font-bold text-slate-900">
                    {formatNaira(todayEntry.posMinor || 0)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-3">
              <Calendar className="w-10 h-10 text-emerald-700/40 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-800">No entry for today yet</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-0.5">
                  Record one total sales figure when you close shop for the day.
                </p>
              </div>
              <button
                onClick={() => setIsDailySalesModalOpen(true)}
                className="px-5 py-2.5 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                + Record Today's Sales
              </button>
            </div>
          )}
        </div>

        {/* Business Intelligence & Cash Flow */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Intelligence Card */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 to-teal-950 text-white rounded-3xl p-5 shadow-xs flex flex-col justify-between">
            <div className="absolute right-4 top-4 w-32 h-32 pointer-events-none opacity-10">
              <SecurityPatternVector className="text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  CashDeck Business Intelligence
                </span>
              </div>
              <p className="text-sm sm:text-base font-medium text-emerald-50 leading-relaxed max-w-2xl">
                "{dashboardData?.aiInsight || 'Recording sales will unlock business diagnostic observations.'}"
              </p>
            </div>
            <div className="relative z-10 mt-4 flex items-center justify-between pt-3 border-t border-emerald-800 text-xs text-emerald-300">
              <span>Deterministic cash flow drivers</span>
              <button onClick={() => onNavigate('reports')} className="text-white font-bold hover:underline">
                View P&L Report →
              </button>
            </div>
          </div>

          {/* Cash Flow Summary */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Monthly Cash Flow (Actual Movement)
              </span>
              <span className="text-[11px] text-slate-400">Does not equate revenue with cash</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-xs text-slate-500 font-medium">Cash In</span>
                <h4 className="text-lg font-bold text-emerald-700 mt-0.5">
                  {formatNaira(metrics.cashFlow.cashInMinor)}
                </h4>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-xs text-slate-500 font-medium">Cash Out</span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  {formatNaira(metrics.cashFlow.cashOutMinor)}
                </h4>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-xs text-slate-500 font-medium">Net Cash Flow</span>
                <h4 className={`text-lg font-bold mt-0.5 ${metrics.cashFlow.netCashFlowMinor >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {formatNaira(metrics.cashFlow.netCashFlowMinor)}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Modal for Daily Sales */}
      <RecordDailySalesModal
        isOpen={isDailySalesModalOpen}
        onClose={() => setIsDailySalesModalOpen(false)}
        workspaceId={activeWorkspace?.id || ''}
        onSuccess={loadDashboard}
      />
    </div>
  );
};
