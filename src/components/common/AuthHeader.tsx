import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const CashDeckLogo: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string; onClick?: () => void }> = ({
  size = 'md',
  className = '',
  onClick
}) => {
  const iconSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-7 h-7' : 'w-6 h-6';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Precision faceted green diamond matching reference UI */}
      <svg
        viewBox="0 0 24 24"
        className={`${iconSize} shrink-0 drop-shadow-xs`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points="12 2, 22 12, 12 22, 2 12" fill="#047857" />
        <polygon points="12 5.5, 18.5 12, 12 18.5, 5.5 12" fill="#10b981" />
        <polygon points="12 8, 16 12, 12 16, 8 12" fill="#ffffff" />
      </svg>
      <span className={`font-extrabold ${textSize} tracking-tight text-slate-900`}>
        CashDeck
      </span>
    </div>
  );
};

interface AuthHeaderProps {
  onBack?: () => void;
  currentStep?: number; // 1 to 4
  totalSteps?: number; // default 4
  rightAction?: {
    text: string;
    actionText: string;
    onAction: () => void;
  };
  className?: string;
  showBackInHeader?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  onBack,
  currentStep,
  totalSteps = 4,
  rightAction,
  className = '',
  showBackInHeader = false
}) => {
  return (
    <header className={`w-full flex items-center justify-between pb-6 select-none ${className}`}>
      {/* Left: Always CashDeck Logo (or Back if showBackInHeader is explicitly requested) */}
      <div className="flex items-center gap-3">
        {showBackInHeader && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-slate-100/70"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <CashDeckLogo />
        )}
      </div>

      {/* Right Side: Either Progress Pill/Dots or Right Action Link */}
      <div className="flex items-center gap-3">
        {currentStep !== undefined && totalSteps > 0 && (
          <div className="flex items-center gap-1.5" aria-label={`Step ${currentStep} of ${totalSteps}`}>
            {Array.from({ length: totalSteps }).map((_, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === currentStep;
              const isPast = stepNum < currentStep;
              return (
                <div
                  key={i}
                  className={`transition-all duration-300 rounded-full ${
                    isActive
                      ? 'w-6 h-1.5 bg-[#047857]'
                      : isPast
                      ? 'w-4 h-1.5 bg-emerald-600/70'
                      : 'w-1.5 h-1.5 bg-slate-300/80'
                  }`}
                />
              );
            })}
          </div>
        )}

        {rightAction && (
          <div className="text-xs sm:text-sm text-slate-500">
            <span>{rightAction.text} </span>
            <button
              type="button"
              onClick={rightAction.onAction}
              className="font-bold text-[#047857] hover:text-emerald-800 hover:underline transition-colors cursor-pointer"
            >
              {rightAction.actionText}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

