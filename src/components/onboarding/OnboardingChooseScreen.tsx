import React, { useState } from 'react';
import { User, Store, Check } from 'lucide-react';
import { AuthHeader } from '../common/AuthHeader';

interface OnboardingChooseScreenProps {
  onChoose: (type: 'personal' | 'business') => Promise<void>;
  onBack?: () => void;
  isLoading?: boolean;
}

export const OnboardingChooseScreen: React.FC<OnboardingChooseScreenProps> = ({
  onChoose,
  isLoading
}) => {
  const [selectedType, setSelectedType] = useState<'personal' | 'business'>('personal');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onChoose(selectedType);
  };

  return (
    <div className="min-h-screen bg-[#edf4f0] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header with Step 1 pill dots */}
      <div className="max-w-xl w-full mx-auto">
        <AuthHeader
          currentStep={1}
          totalSteps={4}
        />
      </div>

      <main className="max-w-xl w-full mx-auto my-auto py-4">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              What are you managing?
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Choose what you want to manage first. You can change this later.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              role="radiogroup"
              aria-label="What are you managing"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* Option 1: Personal */}
              <div
                role="radio"
                aria-checked={selectedType === 'personal'}
                tabIndex={0}
                onClick={() => setSelectedType('personal')}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') setSelectedType('personal');
                }}
                className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all flex flex-col justify-between select-none min-h-[195px] ${
                  selectedType === 'personal'
                    ? 'border-[#047857] bg-emerald-50/25 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Top Row: User Icon + Checkmark badge if selected */}
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      selectedType === 'personal'
                        ? 'bg-emerald-100/80 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <User className="w-6 h-6 stroke-[2]" />
                  </div>

                  {selectedType === 'personal' && (
                    <div className="w-5 h-5 rounded-full bg-[#047857] text-white flex items-center justify-center shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <h3 className="text-base font-bold text-slate-900">Personal</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Track income, spending, savings, investments and financial goals.
                  </p>
                </div>
              </div>

              {/* Option 2: Business */}
              <div
                role="radio"
                aria-checked={selectedType === 'business'}
                tabIndex={0}
                onClick={() => setSelectedType('business')}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') setSelectedType('business');
                }}
                className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all flex flex-col justify-between select-none min-h-[195px] ${
                  selectedType === 'business'
                    ? 'border-[#047857] bg-emerald-50/25 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      selectedType === 'business'
                        ? 'bg-sky-100/80 text-sky-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Store className="w-6 h-6 stroke-[2]" />
                  </div>

                  {selectedType === 'business' && (
                    <div className="w-5 h-5 rounded-full bg-[#047857] text-white flex items-center justify-center shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <h3 className="text-base font-bold text-slate-900">Business</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Track sales, expenses, inventory, customers, suppliers and business performance.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-[#047857] hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer"
            >
              {isLoading ? 'Setting up...' : 'Continue'}
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 py-3">
        CashDeck Financial Operating System • NDPA Compliant
      </footer>
    </div>
  );
};

