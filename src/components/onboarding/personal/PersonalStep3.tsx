import React, { useState } from 'react';
import { ShieldCheck, Home, GraduationCap, Laptop, Car, Plane, TrendingUp, Target, Check, ArrowRight } from 'lucide-react';
import { parseForgivingCurrency } from './PersonalStep2';

interface PersonalStep3Props {
  onContinue: (data: {
    name: string;
    category: string;
    targetAmount: number;
    targetDate: string;
    iconName: string;
  }) => void;
  onSkip: () => void;
  monthlyExpenses?: number;
  initialData?: any;
}

const GOAL_TEMPLATES = [
  { id: 'Emergency Fund', label: 'Emergency Fund', icon: ShieldCheck, category: 'Safety' },
  { id: 'Rent', label: 'Rent Reserve', icon: Home, category: 'Housing' },
  { id: 'School Fees', label: 'School Fees', icon: GraduationCap, category: 'Education' },
  { id: 'Laptop', label: 'Work Laptop / Gear', icon: Laptop, category: 'Work' },
  { id: 'Car', label: 'Car / Vehicle', icon: Car, category: 'Asset' },
  { id: 'Vacation', label: 'Travel / Vacation', icon: Plane, category: 'Leisure' },
  { id: 'Investment', label: 'Investment Capital', icon: TrendingUp, category: 'Wealth' },
  { id: 'Other', label: 'Custom Goal', icon: Target, category: 'Personal' }
];

export const PersonalStep3: React.FC<PersonalStep3Props> = ({
  onContinue,
  onSkip,
  monthlyExpenses = 0,
  initialData
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(initialData?.category || 'Emergency Fund');
  const [customName, setCustomName] = useState(initialData?.name || '');

  // If Emergency Fund is selected and monthly expenses were given, suggest 3 months
  const suggestedEmergency = monthlyExpenses > 0 ? monthlyExpenses * 3 : 500000;

  const [targetAmountStr, setTargetAmountStr] = useState(
    initialData?.targetAmount
      ? initialData.targetAmount.toLocaleString()
      : selectedTemplate === 'Emergency Fund' && monthlyExpenses > 0
      ? suggestedEmergency.toLocaleString()
      : '500000'
  );

  const [targetDate, setTargetDate] = useState(initialData?.targetDate || '2027-12-31');

  const parsedAmount = parseForgivingCurrency(targetAmountStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = selectedTemplate === 'Other' && customName.trim() ? customName.trim() : selectedTemplate;
    onContinue({
      name: finalName,
      category: selectedTemplate,
      targetAmount: parsedAmount,
      targetDate,
      iconName: selectedTemplate
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Choose a goal template
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GOAL_TEMPLATES.map(tmpl => {
            const Icon = tmpl.icon;
            const isSelected = selectedTemplate === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => {
                  setSelectedTemplate(tmpl.id);
                  if (tmpl.id === 'Emergency Fund' && monthlyExpenses > 0) {
                    setTargetAmountStr((monthlyExpenses * 3).toLocaleString());
                  }
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 select-none ${
                  isSelected
                    ? 'bg-emerald-50 border-[#047857] text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span className="text-xs leading-tight">{tmpl.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedTemplate === 'Other' && (
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Goal Name</label>
          <input
            type="text"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            placeholder="e.g. Wedding Savings, Land purchase"
            required
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
          />
        </div>
      )}

      {/* Target Amount */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-slate-700">Target Amount</label>
          {selectedTemplate === 'Emergency Fund' && monthlyExpenses > 0 && (
            <span className="text-[11px] text-emerald-700 font-semibold">
              Suggested 3 mo. expenses: ₦{(monthlyExpenses * 3).toLocaleString()}
            </span>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₦</span>
          <input
            type="text"
            inputMode="numeric"
            value={targetAmountStr}
            onChange={e => setTargetAmountStr(e.target.value)}
            placeholder="e.g. 1,000,000 or 1m"
            required
            className="w-full pl-8 pr-3 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
          />
        </div>
        {parsedAmount > 0 && (
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Target: ₦{parsedAmount.toLocaleString()}
          </span>
        )}
      </div>

      {/* Target Date */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Target Completion Date</label>
        <input
          type="date"
          value={targetDate}
          onChange={e => setTargetDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
        />
      </div>

      {/* Buttons */}
      <div className="pt-4 space-y-2">
        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Create Goal & Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="w-full py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </form>
  );
};
