import React, { useState } from 'react';
import { ArrowRight, Info } from 'lucide-react';

interface PersonalStep2Props {
  onContinue: (data: {
    monthlyIncome?: number;
    monthlyExpenses?: number;
    currentSavings?: number;
    currentInvestments?: number;
  }) => void;
  onSkip: () => void;
  initialData?: any;
}

// Helper to parse forgiving currency inputs like "250k", "1.5m", "350,000"
export function parseForgivingCurrency(raw: string): number {
  if (!raw) return 0;
  const clean = raw.trim().toLowerCase().replace(/[₦, ]/g, '');
  if (clean.endsWith('k')) {
    const num = parseFloat(clean.slice(0, -1));
    return isNaN(num) ? 0 : Math.round(num * 1000);
  }
  if (clean.endsWith('m')) {
    const num = parseFloat(clean.slice(0, -1));
    return isNaN(num) ? 0 : Math.round(num * 1000000);
  }
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : Math.max(0, Math.round(val));
}

export const PersonalStep2: React.FC<PersonalStep2Props> = ({ onContinue, onSkip, initialData }) => {
  const [monthlyIncomeStr, setMonthlyIncomeStr] = useState(
    initialData?.monthlyIncome ? initialData.monthlyIncome.toLocaleString() : ''
  );
  const [monthlyExpensesStr, setMonthlyExpensesStr] = useState(
    initialData?.monthlyExpenses ? initialData.monthlyExpenses.toLocaleString() : ''
  );
  const [currentSavingsStr, setCurrentSavingsStr] = useState(
    initialData?.currentSavings ? initialData.currentSavings.toLocaleString() : ''
  );
  const [currentInvestmentsStr, setCurrentInvestmentsStr] = useState(
    initialData?.currentInvestments ? initialData.currentInvestments.toLocaleString() : ''
  );

  const parsedIncome = parseForgivingCurrency(monthlyIncomeStr);
  const parsedExpenses = parseForgivingCurrency(monthlyExpensesStr);
  const parsedSavings = parseForgivingCurrency(currentSavingsStr);
  const parsedInvestments = parseForgivingCurrency(currentInvestmentsStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue({
      monthlyIncome: parsedIncome,
      monthlyExpenses: parsedExpenses,
      currentSavings: parsedSavings,
      currentInvestments: parsedInvestments
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900 mb-2">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <span>
          These estimates set up baseline targets and savings vaults. All fields are completely optional.
        </span>
      </div>

      {/* Monthly Income */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Estimated Monthly Income <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₦</span>
          <input
            type="text"
            inputMode="numeric"
            value={monthlyIncomeStr}
            onChange={e => setMonthlyIncomeStr(e.target.value)}
            placeholder="e.g. 500,000 or 500k"
            className="w-full pl-8 pr-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
          />
        </div>
        {parsedIncome > 0 && (
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Preview: ₦{parsedIncome.toLocaleString()}
          </span>
        )}
      </div>

      {/* Monthly Expenses */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Average Monthly Expenses <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₦</span>
          <input
            type="text"
            inputMode="numeric"
            value={monthlyExpensesStr}
            onChange={e => setMonthlyExpensesStr(e.target.value)}
            placeholder="e.g. 250,000 or 250k"
            className="w-full pl-8 pr-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
          />
        </div>
        {parsedExpenses > 0 && (
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Preview: ₦{parsedExpenses.toLocaleString()}
          </span>
        )}
      </div>

      {/* Current Savings */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Current Liquid Savings <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₦</span>
          <input
            type="text"
            inputMode="numeric"
            value={currentSavingsStr}
            onChange={e => setCurrentSavingsStr(e.target.value)}
            placeholder="e.g. 1,000,000 or 1m"
            className="w-full pl-8 pr-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
          />
        </div>
        {parsedSavings > 0 && (
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Preview: ₦{parsedSavings.toLocaleString()} (will create your initial Savings Vault)
          </span>
        )}
      </div>

      {/* Current Investments */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Current Investments Value <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₦</span>
          <input
            type="text"
            inputMode="numeric"
            value={currentInvestmentsStr}
            onChange={e => setCurrentInvestmentsStr(e.target.value)}
            placeholder="e.g. 3,500,000 or 3.5m"
            className="w-full pl-8 pr-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
          />
        </div>
        {parsedInvestments > 0 && (
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Preview: ₦{parsedInvestments.toLocaleString()}
          </span>
        )}
      </div>

      {/* Buttons */}
      <div className="pt-4 space-y-2">
        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Continue</span>
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
