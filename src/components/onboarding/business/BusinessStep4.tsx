import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { SuccessCheckIllustration } from '../../common/AuthIllustrations';

interface BusinessStep4Props {
  onComplete: () => Promise<void>;
  businessName?: string;
  isLoading?: boolean;
}

export const BusinessStep4: React.FC<BusinessStep4Props> = ({ onComplete, businessName, isLoading }) => {
  return (
    <div className="space-y-6 text-center py-2">
      <div className="flex justify-center mb-2">
        <SuccessCheckIllustration size={130} />
      </div>

      <div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Your business is ready{businessName ? `, ${businessName}` : ''}!
        </h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          CashDeck will help you track{' '}
          <strong className="text-emerald-900 font-bold">
            Sales · Expenses · Revenue · Profit · Cash Flow
          </strong>
          .
        </p>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-left text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>What's waiting on your business desk:</span>
        </div>
        <p className="text-slate-500 pl-6">
          • One-tap daily sales recording at the end of each day.
        </p>
        <p className="text-slate-500 pl-6">
          • Real-time operating margins and net cash flow vs revenue.
        </p>
        <p className="text-slate-500 pl-6">
          • Customer receivables and supplier payables ledgers.
        </p>
      </div>

      <button
        onClick={onComplete}
        disabled={isLoading}
        className="w-full py-4 px-6 bg-[#047857] hover:bg-emerald-800 disabled:opacity-60 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
      >
        {isLoading ? (
          <span>Opening your business desk...</span>
        ) : (
          <>
            <span>Open Business Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </div>
  );
};
