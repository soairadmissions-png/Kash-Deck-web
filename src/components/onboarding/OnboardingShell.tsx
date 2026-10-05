import React, { ReactNode } from 'react';
import { AuthHeader } from '../common/AuthHeader';
import { ArrowLeft } from 'lucide-react';

interface OnboardingShellProps {
  currentStep: number;
  totalSteps?: number;
  type?: 'personal' | 'business';
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export const OnboardingShell: React.FC<OnboardingShellProps> = ({
  currentStep,
  totalSteps = 4,
  title,
  subtitle,
  onBack,
  children,
  maxWidth = 'max-w-xl'
}) => {
  return (
    <div className="min-h-screen bg-[#edf4f0] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header with Progress Dots */}
      <div className={`${maxWidth} w-full mx-auto`}>
        <AuthHeader
          currentStep={currentStep}
          totalSteps={totalSteps}
        />

        {/* Back Link positioned below the header, aligned to the container left */}
        {onBack && (
          <div className="pt-1 pb-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Card */}
      <main className={`${maxWidth} w-full mx-auto my-auto py-2`}>
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md">
          {title && (
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {children}
        </div>
      </main>

      {/* Clean quiet footer */}
      <footer className="text-center text-xs text-slate-400 py-3">
        CashDeck Financial Operating System • NDPA Compliant
      </footer>
    </div>
  );
};

