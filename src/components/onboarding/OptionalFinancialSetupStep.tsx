import React from 'react';
import { Receipt, Target, TrendingUp, Calendar, ChevronRight } from 'lucide-react';

interface OptionalFinancialSetupStepProps {
  onComplete: () => Promise<void>;
  isLoading?: boolean;
}

export const OptionalFinancialSetupStep: React.FC<OptionalFinancialSetupStepProps> = ({
  onComplete,
  isLoading
}) => {
  const options = [
    {
      id: 'transactions',
      title: 'Transactions *',
      description: 'Add past transactions',
      icon: Receipt,
      color: 'bg-emerald-50 text-emerald-800'
    },
    {
      id: 'goals',
      title: 'Savings goal',
      description: 'Set a savings goal',
      icon: Target,
      color: 'bg-teal-50 text-teal-800'
    },
    {
      id: 'investments',
      title: 'Investment',
      description: 'Track your investments',
      icon: TrendingUp,
      color: 'bg-sky-50 text-sky-800'
    },
    {
      id: 'expenses',
      title: 'Recurring expense',
      description: 'Add recurring payments',
      icon: Calendar,
      color: 'bg-purple-50 text-purple-800'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Want to add anything else?
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          You can add information manually now or let CashDeck build your financial picture over time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {options.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={onComplete}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </button>
          );
        })}
      </div>

      {/* Bottom Bar: Skip for now on left, Continue on right */}
      <div className="flex items-center justify-between pt-5 border-t border-slate-100">
        <button
          type="button"
          onClick={onComplete}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          Skip for now
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={onComplete}
          className="py-3 px-6 bg-[#047857] hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center cursor-pointer"
        >
          {isLoading ? 'Setting up...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

