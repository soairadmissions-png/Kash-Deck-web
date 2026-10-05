import React from 'react';
import { Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { CurrencyWaveVector, SecurityPatternVector } from './UiVectors';

interface HeroBalanceCardProps {
  title?: string;
  amount: number;
  percentageChange?: string;
  timeframe?: string;
  currency?: string;
}

export const HeroBalanceCard: React.FC<HeroBalanceCardProps> = ({
  title = 'Total Balance',
  amount,
  percentageChange = '12% vs last month',
  currency = '₦'
}) => {
  const { hideBalances, toggleHideBalances } = useFinancial();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#065f46] via-[#047857] to-[#059669] p-4 sm:p-5 lg:p-6 text-white shadow-sm flex flex-col justify-between min-h-[170px] group transition-all">
      {/* Background UI Vectors for fintech texture */}
      <div className="absolute right-0 bottom-0 w-3/4 h-24 pointer-events-none opacity-40">
        <CurrencyWaveVector className="text-emerald-300" />
      </div>
      <div className="absolute -right-6 -top-6 w-32 h-32 pointer-events-none opacity-20">
        <SecurityPatternVector className="text-emerald-100" />
      </div>

      {/* Top row: Label and Eye Toggle */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-emerald-100">{title}</span>
          <button
            onClick={toggleHideBalances}
            className="text-emerald-200 hover:text-white transition-colors p-1 rounded focus:outline-none"
            title={hideBalances ? 'Show balance' : 'Hide balance'}
          >
            {hideBalances ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Center Amount - Responsive fluid typography */}
      <div className="my-2 z-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight truncate">
          {hideBalances ? '••••••••' : `${currency}${amount.toLocaleString()}`}
        </h2>
      </div>

      {/* Bottom Percentage Badge */}
      <div className="flex items-center gap-2 z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-900/40 text-emerald-200 text-[11px] sm:text-xs font-semibold backdrop-blur-xs border border-emerald-400/20">
          <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300" />
          <span>{percentageChange}</span>
        </div>
      </div>

      {/* Stylized Wallet Vector Illustration */}
      <div className="absolute right-3 bottom-2 sm:right-6 sm:bottom-4 pointer-events-none select-none opacity-75 sm:opacity-90">
        <svg
          width="110"
          height="85"
          viewBox="0 0 135 105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md transform translate-x-2 translate-y-1 sm:w-[135px] sm:h-[105px]"
        >
          {/* Back card */}
          <rect
            x="32"
            y="6"
            width="65"
            height="40"
            rx="6"
            fill="#a7f3d0"
            transform="rotate(6 32 6)"
            opacity="0.9"
          />
          {/* Main wallet body */}
          <rect
            x="15"
            y="24"
            width="100"
            height="70"
            rx="14"
            fill="#34d399"
          />
          {/* Wallet flap highlight */}
          <path
            d="M15 36C15 29.3726 20.3726 24 27 24H103C109.627 24 115 29.3726 115 36V44H15V36Z"
            fill="#6ee7b7"
          />
          {/* Stitching or accent crease */}
          <path
            d="M15 45H115"
            stroke="#059669"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          {/* Wallet clasp */}
          <rect
            x="76"
            y="52"
            width="32"
            height="18"
            rx="5"
            fill="#065f46"
          />
          <circle cx="86" cy="61" r="3" fill="#a7f3d0" />
        </svg>
      </div>
    </div>
  );
};
