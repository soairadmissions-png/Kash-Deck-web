import React, { useState } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { parseForgivingCurrency } from '../personal/PersonalStep2';

interface BusinessStep2Props {
  onContinue: (data: {
    currentCashBalance?: number;
    averageMonthlySales?: number;
    averageMonthlyExpenses?: number;
    currentBusinessSavings?: number;
  }) => void;
  onSkip: () => void;
  initialData?: any;
}

export const BusinessStep2: React.FC<BusinessStep2Props> = ({ onContinue, onSkip, initialData }) => {
  const [cashBalanceStr, setCashBalanceStr] = useState(
    initialData?.currentCashBalance ? initialData.currentCashBalance.toLocaleString() : ''
  );
  const [monthlySalesStr, setMonthlySalesStr] = useState(
    initialData?.averageMonthlySales ? initialData.averageMonthlySales.toLocaleString() : ''
  );
  const [monthlyExpensesStr, setMonthlyExpensesStr] = useState(
    initialData?.averageMonthlyExpenses ? initialData.averageMonthlyExpenses.toLocaleString() : ''
  );
  const [businessSavingsStr, setBusinessSavingsStr] = useState(
    initialData?.currentBusinessSavings ? initialData.currentBusinessSavings.toLocaleString() : ''
  );

  const parsedCash = parseForgivingCurrency(cashBalanceStr);
  const parsedSales = parseForgivingCurrency(monthlySalesStr);
  const parsedExpenses = parseForgivingCurrency(monthlyExpensesStr);
  const parsedSavings = parseForgivingCurrency(businessSavingsStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue({
      currentCashBalance: parsedCash,
      averageMonthlySales: parsedSales,
      averageMonthlyExpenses: parsedExpenses,
      currentBusinessSavings: parsedSavings
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900 mb-2">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <span>
          Starting figures set your opening cash drawer and baseline targets. Skip anything you don't know yet.
        </span>
      </div>

      {/* Current Cash Balance */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Current Operating Cash on Hand / Bank <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₦</span>
          <input
            type="text"
            inputMode="numeric"
            value={cashBalanceStr}
            onChange={e => setCashBalanceStr(e.target.value)}
            placeholder="e.g. 500,000 or 500k"
            className="w-full pl-8 pr-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
          />
        </div>
        {parsedCash > 0 && (
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Opening cash balance: ₦{parsedCash.toLocaleString()}
          </span>
        )}
      </div>

      {/* Average Monthly Sales */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Average Monthly Sales <span className="text-slate-400 font-normal">(Optional target baseline)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₦</span>
          <input
            type="text"
            inputMode="numeric"
            value={monthlySalesStr}
            onChange={e => setMonthlySalesStr(e.target.value)}
            placeholder="e.g. 2,000,000 or 2m"
            className="w-full pl-8 pr-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
          />
        </div>
        {parsedSales > 0 && (
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Baseline sales: ₦{parsedSales.toLocaleString()}
          </span>
        )}
      </div>

      {/* Average Monthly Expenses */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Average Monthly Expenses <span className="text-slate-400 font-normal">(Rent, stock, staff)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₦</span>
          <input
            type="text"
            inputMode="numeric"
            value={monthlyExpensesStr}
            onChange={e => setMonthlyExpensesStr(e.target.value)}
            placeholder="e.g. 1,200,000 or 1.2m"
            className="w-full pl-8 pr-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
          />
        </div>
        {parsedExpenses > 0 && (
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Baseline expenses: ₦{parsedExpenses.toLocaleString()}
          </span>
        )}
      </div>

      {/* Current Business Savings */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Current Business Reserves / Savings <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₦</span>
          <input
            type="text"
            inputMode="numeric"
            value={businessSavingsStr}
            onChange={e => setBusinessSavingsStr(e.target.value)}
            placeholder="e.g. 800,000 or 800k"
            className="w-full pl-8 pr-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
          />
        </div>
        {parsedSavings > 0 && (
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Opening reserves: ₦{parsedSavings.toLocaleString()}
          </span>
        )}
      </div>

      {/* Buttons */}
      <div className="pt-4 space-y-2">
        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Continue to Sales Tracking</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="w-full py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          I'll do this later
        </button>
      </div>
    </form>
  );
};
