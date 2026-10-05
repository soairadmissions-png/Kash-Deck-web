import React, { useState } from 'react';
import { Briefcase, Building2, Laptop, MoreHorizontal, Check, Circle } from 'lucide-react';

interface PersonalStep1Props {
  onContinue: (data: { incomeSource: string; incomePattern: string }) => void;
  onSkip?: () => void;
  initialData?: { incomeSource?: string; incomePattern?: string };
}

const INCOME_SOURCES = [
  { id: 'salary', label: 'Salary', icon: Briefcase },
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'freelance', label: 'Freelance', icon: Laptop },
  { id: 'other', label: 'Other', icon: MoreHorizontal }
];

const INCOME_PATTERNS = [
  { id: 'regular', label: 'Regular' },
  { id: 'irregular', label: 'Irregular' }
];

export const PersonalStep1: React.FC<PersonalStep1Props> = ({ onContinue, onSkip, initialData }) => {
  const [incomeSource, setIncomeSource] = useState(initialData?.incomeSource || 'salary');
  const [incomePattern, setIncomePattern] = useState(initialData?.incomePattern || 'regular');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue({ incomeSource, incomePattern });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Let's set up your finances
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          A few details help CashDeck make your experience more useful.
        </p>
      </div>

      {/* SECTION 1: Income source */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2.5">
          Income source
        </label>
        <div className="grid grid-cols-2 gap-3">
          {INCOME_SOURCES.map(source => {
            const Icon = source.icon;
            const isSelected = incomeSource === source.id;
            return (
              <button
                key={source.id}
                type="button"
                onClick={() => setIncomeSource(source.id)}
                className={`py-3.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-[#047857] bg-emerald-50/40 text-slate-900 shadow-2xs ring-1 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-emerald-100 text-[#047857]' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-xs text-slate-900">{source.label}</span>
                </div>

                {isSelected ? (
                  <div className="w-4 h-4 rounded-full bg-[#047857] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 stroke-[1.5]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Income pattern */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2.5">
          Income pattern
        </label>
        <div className="grid grid-cols-2 gap-3">
          {INCOME_PATTERNS.map(pattern => {
            const isSelected = incomePattern === pattern.id;
            return (
              <button
                key={pattern.id}
                type="button"
                onClick={() => setIncomePattern(pattern.id)}
                className={`py-3.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-[#047857] bg-emerald-50/40 text-slate-900 shadow-2xs ring-1 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="font-semibold text-xs text-slate-900">{pattern.label}</span>
                {isSelected ? (
                  <div className="w-4 h-4 rounded-full bg-[#047857] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 stroke-[1.5]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Bar: Skip on left, Continue on right */}
      <div className="flex items-center justify-between pt-5 border-t border-slate-100">
        <button
          type="button"
          onClick={onSkip || (() => onContinue({ incomeSource, incomePattern }))}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          Skip for now
        </button>

        <button
          type="submit"
          className="py-3 px-6 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

