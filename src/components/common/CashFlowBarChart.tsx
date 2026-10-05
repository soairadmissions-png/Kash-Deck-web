import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CashFlowBarChartProps {
  title?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  isSingleSeries?: boolean;
}

export const CashFlowBarChart: React.FC<CashFlowBarChartProps> = ({
  title = 'Cash Flow',
  primaryLabel = 'Income',
  secondaryLabel = 'Expenses',
  isSingleSeries = false
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('This month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Realistic sample period bars
  const periods = [
    { label: 'Oct 1', income: 1.4, expense: 0.8 },
    { label: 'Oct 8', income: 1.8, expense: 1.1 },
    { label: 'Oct 15', income: 1.2, expense: 0.6 },
    { label: 'Oct 22', income: 1.9, expense: 0.9 },
    { label: 'Oct 31', income: 1.5, expense: 0.7 }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(p => !p)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors"
          >
            <span>{selectedTimeframe}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1 z-20 text-xs">
              {['This week', 'This month', 'Last month', 'This quarter'].map(tf => (
                <button
                  key={tf}
                  onClick={() => {
                    setSelectedTimeframe(tf);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-slate-700"
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="h-44 w-full flex flex-col justify-between pt-2">
        {/* Chart body with grid lines */}
        <div className="relative flex-1 flex items-end justify-between px-2 sm:px-6">
          {/* Horizontal dotted grid lines */}
          <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-200" />
          <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-200" />
          <div className="absolute inset-x-0 bottom-0 border-b border-slate-200" />

          {/* Y Axis Labels */}
          <div className="absolute -left-1 sm:-left-3 inset-y-0 flex flex-col justify-between text-[10px] font-semibold text-slate-400 pointer-events-none">
            <span>₦2.0M</span>
            <span>₦1.0M</span>
            <span>₦0</span>
          </div>

          {/* Bar Groups */}
          <div className="w-full pl-8 sm:pl-10 h-full flex items-end justify-around">
            {periods.map((p, idx) => {
              const incomeHeight = `${(p.income / 2.0) * 100}%`;
              const expenseHeight = `${(p.expense / 2.0) * 100}%`;

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <div className="flex items-end gap-1 sm:gap-1.5 h-full">
                    {/* Primary Bar */}
                    <div
                      style={{ height: incomeHeight }}
                      className="w-2.5 sm:w-3.5 bg-emerald-600 rounded-t-sm transition-all duration-300 group-hover:bg-emerald-500 relative"
                      title={`${primaryLabel}: ₦${p.income}M`}
                    />
                    {/* Secondary Bar */}
                    {!isSingleSeries && (
                      <div
                        style={{ height: expenseHeight }}
                        className="w-2.5 sm:w-3.5 bg-[#0f766e] rounded-t-sm transition-all duration-300 group-hover:bg-teal-600 relative"
                        title={`${secondaryLabel}: ₦${p.expense}M`}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-2 whitespace-nowrap">
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-3 mt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="text-xs text-slate-600 font-medium">{primaryLabel}</span>
          </div>
          {!isSingleSeries && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0f766e]" />
              <span className="text-xs text-slate-600 font-medium">{secondaryLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
