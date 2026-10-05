import React, { useState } from 'react';
import { Calendar, Receipt, Check, ArrowRight } from 'lucide-react';

interface BusinessStep3Props {
  onContinue: (data: { salesEntryMode: 'daily' | 'transaction' }) => void;
  initialData?: { salesEntryMode?: 'daily' | 'transaction' };
}

export const BusinessStep3: React.FC<BusinessStep3Props> = ({ onContinue, initialData }) => {
  const [salesEntryMode, setSalesEntryMode] = useState<'daily' | 'transaction'>(
    initialData?.salesEntryMode || 'daily'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue({ salesEntryMode });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        {/* Option 1: Daily Sales (Recommended) */}
        <div
          role="radio"
          aria-checked={salesEntryMode === 'daily'}
          tabIndex={0}
          onClick={() => setSalesEntryMode('daily')}
          onKeyDown={e => {
            if (e.key === ' ' || e.key === 'Enter') setSalesEntryMode('daily');
          }}
          className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 select-none ${
            salesEntryMode === 'daily'
              ? 'bg-emerald-50/60 border-[#047857] shadow-sm ring-1 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              salesEntryMode === 'daily'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Calendar className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">
                Daily Sales
              </h4>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Recommended
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Enter one total sales figure at the end of each day (with optional cash/transfer/POS breakdown). Fast, low friction, and perfect for retail, food, and daily business.
            </p>
          </div>

          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              salesEntryMode === 'daily' ? 'bg-[#047857] text-white' : 'border-2 border-slate-300'
            }`}
          >
            {salesEntryMode === 'daily' && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        </div>

        {/* Option 2: Individual Transactions */}
        <div
          role="radio"
          aria-checked={salesEntryMode === 'transaction'}
          tabIndex={0}
          onClick={() => setSalesEntryMode('transaction')}
          onKeyDown={e => {
            if (e.key === ' ' || e.key === 'Enter') setSalesEntryMode('transaction');
          }}
          className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 select-none ${
            salesEntryMode === 'transaction'
              ? 'bg-emerald-50/60 border-[#047857] shadow-sm ring-1 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              salesEntryMode === 'transaction'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Receipt className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900">
              Individual Transactions
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Record individual sales line-by-line when you need detailed customer invoicing, itemized receipts, and per-ticket tracking.
            </p>
          </div>

          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              salesEntryMode === 'transaction' ? 'bg-[#047857] text-white' : 'border-2 border-slate-300'
            }`}
          >
            {salesEntryMode === 'transaction' && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        </div>
      </div>

      {/* Philosophy line */}
      <div className="text-center py-2 border-t border-slate-100">
        <p className="text-xs italic text-slate-500">
          "The owner runs the business. CashDeck records and interprets the numbers."
        </p>
        <span className="text-[10px] text-slate-400 block mt-0.5">
          You can change this anytime in Business Settings without losing past records.
        </span>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 px-4 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
      >
        <span>Confirm Sales Mode</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
};
