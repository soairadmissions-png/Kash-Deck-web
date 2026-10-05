import React, { useState } from 'react';
import { TrendingUp, Plus, ArrowUpRight, PieChart, ShieldAlert } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const InvestmentsScreen: React.FC = () => {
  const { investments } = useFinancial();

  const [activeType, setActiveType] = useState<string>('all');

  const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0);
  const totalCurrentValue = investments.reduce((s, i) => s + i.currentValue, 0);
  const totalGainLoss = totalCurrentValue - totalInvested;
  const totalGainPercent = Math.round((totalGainLoss / totalInvested) * 1000) / 10;

  const filteredInvestments = investments.filter(i => {
    if (activeType === 'all') return true;
    return i.type.toLowerCase() === activeType.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Investments & Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tracking-only command center for Nigerian treasury bills, equities, mutual funds and assets.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
          <span>Tracking Mode (Read-Only)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total Current Valuation</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₦{totalCurrentValue.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Across {investments.length} tracked holdings
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Principal Invested</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₦{totalInvested.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Cost basis capital
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Unrealized Gain / Return</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1 flex items-baseline gap-1.5">
            <span>+₦{totalGainLoss.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600">({totalGainPercent}%)</span>
          </p>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            ↑ Ahead of annual inflation target
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['All', 'Treasury bills', 'Mutual funds', 'Stocks', 'Crypto'].map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type === 'All' ? 'all' : type)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              (activeType === 'all' && type === 'All') || activeType.toLowerCase() === type.toLowerCase()
                ? 'bg-[#047857] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/70 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 text-slate-400 font-semibold border-b border-slate-100">
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Asset Class</th>
                <th className="py-3 px-4">Custodian / Exchange</th>
                <th className="py-3 px-4 text-right">Invested</th>
                <th className="py-3 px-4 text-right">Current Value</th>
                <th className="py-3 px-4 text-right">Total Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvestments.map(asset => (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                      <span>{asset.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {asset.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {asset.institution}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600 font-medium">
                    ₦{asset.investedAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    ₦{asset.currentValue.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                    <span className="text-emerald-700">
                      +₦{asset.gainLoss.toLocaleString()} (+{asset.gainLossPercent}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
