import React from 'react';
import { ArrowUp, ArrowDown, Wallet, TrendingUp, DollarSign } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { CardFlowVector } from './UiVectors';

interface MetricCardProps {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'savings' | 'profit' | 'cashflow';
  subtext?: string;
  currency?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  type,
  subtext = 'This month',
  currency = '₦',
  onClick
}) => {
  const { hideBalances } = useFinancial();

  // Color configurations matching screenshots
  const config = {
    income: {
      icon: ArrowUp,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      sparklineColor: '#10b981',
      sparklinePath: 'M0,25 C20,24 35,12 55,20 C75,28 90,5 110,12 C125,18 135,2 150,8'
    },
    expense: {
      icon: ArrowDown,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      sparklineColor: '#ef4444',
      sparklinePath: 'M0,15 C25,22 45,8 70,22 C95,30 115,10 135,16 C142,19 148,22 150,20'
    },
    savings: {
      icon: Wallet,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      sparklineColor: '#6366f1',
      sparklinePath: 'M0,22 C30,12 50,26 80,14 C105,6 125,24 150,15'
    },
    profit: {
      icon: TrendingUp,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      sparklineColor: '#a855f7',
      sparklinePath: 'M0,24 C25,18 50,28 75,12 C100,5 125,16 150,6'
    },
    cashflow: {
      icon: DollarSign,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      sparklineColor: '#0ea5e9',
      sparklinePath: 'M0,20 C30,25 60,10 90,18 C115,22 135,8 150,14'
    }
  }[type];

  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between min-h-[160px] sm:min-h-[170px] ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all' : ''
      }`}
    >
      {/* Background vector watermark */}
      <div className="absolute -right-4 -top-2 w-28 h-20 pointer-events-none opacity-40">
        <CardFlowVector className="text-slate-400" />
      </div>

      <div className="relative z-10">
        {/* Top: Circle icon and title */}
        <div className="flex items-center gap-2 sm:gap-2.5 mb-1.5 sm:mb-2">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${config.iconBg} ${config.iconColor} flex items-center justify-center shrink-0`}>
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-600 truncate">{title}</span>
        </div>

        {/* Amount - responsive font */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1 truncate">
          {hideBalances ? '••••••' : `${currency}${amount.toLocaleString()}`}
        </h3>
        <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{subtext}</p>
      </div>

      {/* Mini sparkline SVG graph */}
      <div className="w-full h-8 pt-2 overflow-hidden flex items-end relative z-10">
        <svg
          viewBox="0 0 150 32"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <path
            d={config.sparklinePath}
            fill="none"
            stroke={config.sparklineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
