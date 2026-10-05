import React, { useState } from 'react';
import { ArrowRight, Building, Check } from 'lucide-react';

interface BusinessStep1Props {
  onContinue: (data: {
    businessName: string;
    businessType: string;
    currentTrackingMethod: string;
  }) => void;
  initialData?: {
    businessName?: string;
    businessType?: string;
    currentTrackingMethod?: string;
  };
}

const BUSINESS_TYPES = [
  'Retail',
  'Food & Restaurant',
  'Services',
  'E-commerce',
  'Manufacturing',
  'Professional Services',
  'Other'
];

const TRACKING_METHODS = [
  'Notebook / Paper ledger',
  'Spreadsheet (Excel / Google Sheets)',
  'POS machine terminal',
  'Accounting software',
  "I don't currently track them"
];

export const BusinessStep1: React.FC<BusinessStep1Props> = ({ onContinue, initialData }) => {
  const [businessName, setBusinessName] = useState(initialData?.businessName || '');
  const [businessType, setBusinessType] = useState(initialData?.businessType || 'Retail');
  const [currentTrackingMethod, setCurrentTrackingMethod] = useState(
    initialData?.currentTrackingMethod || 'Notebook / Paper ledger'
  );
  const [customType, setCustomType] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Please enter your business or trading name');
      return;
    }

    const finalType = businessType === 'Other' && customType.trim() ? customType.trim() : businessType;
    onContinue({
      businessName: businessName.trim(),
      businessType: finalType,
      currentTrackingMethod
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Business Name (Required) */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
          Business Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={businessName}
            onChange={e => {
              setBusinessName(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Ade Wholesale Stores, Lagos Kitchen"
            required
            autoFocus
            className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
          />
        </div>
      </div>

      {/* Business Type */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Business Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BUSINESS_TYPES.map(bt => {
            const isSelected = businessType === bt;
            return (
              <button
                key={bt}
                type="button"
                onClick={() => setBusinessType(bt)}
                className={`py-2 px-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-50 border-[#047857] text-emerald-950 font-bold ring-1 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{bt}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
              </button>
            );
          })}
        </div>

        {businessType === 'Other' && (
          <input
            type="text"
            value={customType}
            onChange={e => setCustomType(e.target.value)}
            placeholder="Specify your business line..."
            className="mt-2 w-full px-3.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none text-slate-800"
          />
        )}
      </div>

      {/* How do you currently track finances? */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          How do you currently track your finances?
        </label>
        <div className="space-y-1.5">
          {TRACKING_METHODS.map(method => {
            const isSelected = currentTrackingMethod === method;
            return (
              <button
                key={method}
                type="button"
                onClick={() => setCurrentTrackingMethod(method)}
                className={`w-full py-2.5 px-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-50 border-[#047857] text-emerald-950 font-bold ring-1 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{method}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 px-4 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 mt-6"
      >
        <span>Continue to Starting Numbers</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
};
