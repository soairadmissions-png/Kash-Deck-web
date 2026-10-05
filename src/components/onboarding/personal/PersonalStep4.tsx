import React from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, Wallet } from 'lucide-react';

interface PersonalStep4Props {
  onComplete: () => Promise<void>;
  userName?: string;
  isLoading?: boolean;
}

export const PersonalStep4: React.FC<PersonalStep4Props> = ({ onComplete, userName, isLoading }) => {
  return (
    <div className="space-y-6 text-center py-2">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
        <CheckCircle2 className="w-8 h-8 text-emerald-700" />
      </div>

      <div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          You're ready{userName ? `, ${userName}` : ''}!
        </h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          Your personal CashDeck is ready to help you understand{' '}
          <strong className="text-emerald-900 font-bold">
            Income · Spending · Savings · Goals · Investments
          </strong>
          .
        </p>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-left text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>What's next on your dashboard:</span>
        </div>
        <p className="text-slate-500 pl-6">
          • See your liquid balances and Safe-to-Spend limit.
        </p>
        <p className="text-slate-500 pl-6">
          • Categorize incoming transactions or record cash on hand.
        </p>
        <p className="text-slate-500 pl-6">
          • Track your savings vaults and active goal progress.
        </p>
      </div>

      <button
        onClick={onComplete}
        disabled={isLoading}
        className="w-full py-4 px-6 bg-[#047857] hover:bg-emerald-800 disabled:opacity-60 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
      >
        {isLoading ? (
          <span>Setting up your dashboard...</span>
        ) : (
          <>
            <span>Go to My Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </div>
  );
};
