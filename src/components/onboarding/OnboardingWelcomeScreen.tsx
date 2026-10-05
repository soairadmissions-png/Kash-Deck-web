import React from 'react';
import { AuthHeader } from '../common/AuthHeader';
import { WalletIllustration } from '../common/AuthIllustrations';

interface OnboardingWelcomeScreenProps {
  onContinue: () => void;
  onSkip?: () => void;
  userName?: string;
}

export const OnboardingWelcomeScreen: React.FC<OnboardingWelcomeScreenProps> = ({
  onContinue,
  onSkip,
  userName
}) => {
  return (
    <div className="min-h-screen bg-[#edf4f0] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header with dots */}
      <div className="max-w-md w-full mx-auto">
        <AuthHeader currentStep={0} totalSteps={4} />
      </div>

      <main className="max-w-md w-full mx-auto my-auto py-4">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md text-center">
          {/* Centered Wallet Illustration with orbit badges */}
          <div className="flex justify-center mb-6">
            <WalletIllustration size={230} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to CashDeck{userName ? `, ${userName}` : ''}
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            Your money, business, goals and financial insights — all in one place.
          </p>

          <button
            type="button"
            onClick={onContinue}
            className="w-full mt-8 py-3.5 px-6 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer"
          >
            Let's get started
          </button>

          {onSkip && (
            <div className="text-center pt-3.5">
              <button
                type="button"
                onClick={onSkip}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                Skip setup
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 py-3">
        CashDeck Financial Operating System • NDPA Compliant
      </footer>
    </div>
  );
};

