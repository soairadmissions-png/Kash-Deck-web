import React from 'react';
import { X, Store, Utensils, Briefcase, Boxes, Factory, Building2, Check } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { BusinessType } from '../../types';

interface BusinessTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BusinessTypeModal: React.FC<BusinessTypeModalProps> = ({ isOpen, onClose }) => {
  const { business, updateBusiness } = useFinancial();

  if (!isOpen) return null;

  const types: { id: BusinessType; title: string; desc: string; icon: any }[] = [
    { id: 'Retail', title: 'Retail & Storefront', desc: 'Gadgets, fashion, supermarkets and walk-in sales.', icon: Store },
    { id: 'Food', title: 'Food & Hospitality', desc: 'Restaurants, bakeries, cafes and ingredient batches.', icon: Utensils },
    { id: 'Services', title: 'Services & Agencies', desc: 'Consulting, software, design, legal and retainers.', icon: Briefcase },
    { id: 'Wholesale', title: 'Wholesale & Distribution', desc: 'Bulk supply, credit terms, cartons and palettes.', icon: Boxes },
    { id: 'Manufacturing', title: 'Manufacturing', desc: 'Raw material intake, production batches and assembly.', icon: Factory },
    { id: 'Other', title: 'Other Commerce', desc: 'General business trade and specialized operations.', icon: Building2 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-150 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">What type of business do you run?</h3>
            <p className="text-[11px] text-slate-500">Configures prominent workflows without forcing irrelevant features.</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {types.map(t => {
            const Icon = t.icon;
            const isSelected = business.business_type === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  updateBusiness({ business_type: t.id });
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.title}</h4>
                    <p className="text-[11px] text-slate-500">{t.desc}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
