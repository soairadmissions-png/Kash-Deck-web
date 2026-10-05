import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  ChevronDown,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { CurrencyWaveVector, SecurityPatternVector } from '../common/UiVectors';

export const ReportsScreen: React.FC = () => {
  const { personalMetrics, businessMetrics, transactions, sales, dateRange } = useFinancial();

  const [reportType, setReportType] = useState<'personal' | 'business'>('personal');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownload = (format: 'PDF' | 'Excel' | 'CSV') => {
    // Generate simulated export file
    const title = reportType === 'personal' ? 'CashDeck_Personal_P&L' : 'CashDeck_Business_Performance';
    const filename = `${title}_${new Date().toISOString().split('T')[0]}.${format === 'Excel' ? 'xlsx' : format.toLowerCase()}`;

    const dummyContent = format === 'CSV'
      ? `Date,Type,Category,Amount\n2026-10-02,Revenue,Sales,780000\n2026-10-01,Expense,Inventory,3600000\n`
      : `CashDeck Financial Statement - ${dateRange}\nReport: ${reportType.toUpperCase()}\nTotal Balance/Revenue: ₦${(reportType === 'personal' ? personalMetrics.totalBalance : businessMetrics.revenue).toLocaleString()}`;

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Financial Reports & Statements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audit-ready monthly summaries, income-vs-expenses statements, and multi-format exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownload('PDF')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => handleDownload('Excel')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => handleDownload('CSV')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
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

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setReportType('personal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            reportType === 'personal'
              ? 'bg-[#047857] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
          }`}
        >
          Personal Financial Report
        </button>
        <button
          onClick={() => setReportType('business')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            reportType === 'business'
              ? 'bg-[#047857] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
          }`}
        >
          Business P&L Statement
        </button>
      </div>

      {/* Report Summary Card */}
      {reportType === 'personal' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Monthly Inflow</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">₦850,000</p>
              <span className="text-[11px] text-emerald-700 mt-1 block">Salary & returns</span>
            </div>
            <div className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Monthly Outflow</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">₦420,000</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Living & discretionary</span>
            </div>
            <div className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-xs">
              <div className="absolute right-0 bottom-0 w-24 h-12 pointer-events-none opacity-20">
                <CurrencyWaveVector className="text-emerald-600" />
              </div>
              <span className="text-xs text-slate-400 font-medium">Savings Rate</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight mt-1">35.3%</p>
              <span className="text-[11px] text-slate-400 mt-1 block">₦300,000 preserved</span>
            </div>
            <div className="relative overflow-hidden bg-gradient-to-br from-[#065f46] to-[#047857] text-white rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="absolute -right-4 -top-4 w-20 h-20 pointer-events-none opacity-20">
                <SecurityPatternVector className="text-emerald-100" />
              </div>
              <span className="text-xs text-emerald-200 font-medium">Calculated Net Worth</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">₦9,709,000</p>
              <span className="text-[11px] text-emerald-200 mt-1 block">Liquid cash + Portfolio</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Personal Cash Flow Summary ({dateRange})
            </h3>
            <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="p-3.5 bg-slate-50 font-bold text-slate-700 flex justify-between">
                <span>Account Flow Category</span>
                <span>Amount (₦)</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span>Gross Inflow (Salary & Transfers)</span>
                <span className="font-bold text-emerald-700">+₦850,000</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span>Essential Expenses (Housing, Utilities, Groceries)</span>
                <span className="font-bold text-slate-800">-₦285,600</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span>Discretionary Spending (Shopping, Transport, Dining)</span>
                <span className="font-bold text-slate-800">-₦134,400</span>
              </div>
              <div className="p-3.5 flex justify-between bg-emerald-50/50">
                <span className="font-bold text-emerald-950">Net Personal Savings Retained</span>
                <span className="font-extrabold text-emerald-800">+₦430,000</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Total Revenue</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">₦{businessMetrics.revenue.toLocaleString()}</p>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">{businessMetrics.salesCount} verified sales</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Operating Expenses</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">₦{businessMetrics.operatingExpenses.toLocaleString()}</p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{businessMetrics.expensesCount} operating expenses</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Net Profit</span>
              <p className={`text-2xl font-bold mt-1 ${businessMetrics.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                ₦{businessMetrics.netProfit.toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">Margin: {businessMetrics.profitMargin}%</span>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
              <span className="text-xs text-slate-400 font-medium">Net Cash Flow</span>
              <p className={`text-2xl font-bold mt-1 ${businessMetrics.netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                ₦{businessMetrics.netCashFlow.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">₦{businessMetrics.cashInflow.toLocaleString()} in • ₦{businessMetrics.cashOutflow.toLocaleString()} out</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Business Statement of Profit & Loss ({dateRange})
            </h3>
            <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="p-3.5 bg-slate-50 font-bold text-slate-700 flex justify-between">
                <span>P&L Line Item</span>
                <span>Amount (₦)</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span>Gross Revenue from Sales</span>
                <span className="font-bold text-emerald-700">+₦{businessMetrics.revenue.toLocaleString()}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span>Cost of Goods Sold (Wholesale Inventory Sourcing)</span>
                <span className="font-bold text-slate-800">-₦{businessMetrics.costOfGoodsSold.toLocaleString()}</span>
              </div>
              <div className="p-3.5 flex justify-between bg-slate-50/50">
                <span className="font-semibold text-slate-800">Gross Operating Profit</span>
                <span className="font-bold text-emerald-800">₦{businessMetrics.grossProfit.toLocaleString()}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span>Operating Expenses (Rent, Utilities, Shipping, Dispatch)</span>
                <span className="font-bold text-rose-700">-₦{businessMetrics.operatingExpenses.toLocaleString()}</span>
              </div>
              <div className="p-3.5 flex justify-between bg-emerald-50/50">
                <span className="font-bold text-emerald-950">Net Operating Profit</span>
                <span className={`font-extrabold ${businessMetrics.netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                  ₦{businessMetrics.netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
