import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DonutSegment {
  label: string;
  percentage: number;
  amount?: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  totalLabel?: string;
  totalAmount: number;
  segments: DonutSegment[];
  currency?: string;
  onViewAll?: () => void;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  title,
  totalLabel = 'Total Spent',
  totalAmount,
  segments,
  currency = '₦',
  onViewAll
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('This month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // SVG Donut geometry
  const radius = 62;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDashoffset for each segment
  let accumulatedPercent = 0;

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
              {['This week', 'This month', 'Last month', 'This year'].map(tf => (
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

      {/* Donut and Legend Layout */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background track circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Render segments with small gaps */}
            {segments.map((seg, idx) => {
              const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += seg.percentage;

              return (
                <circle
                  key={idx}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 ease-out hover:opacity-90"
                />
              );
            })}
          </svg>

          {/* Inner Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2 pointer-events-none">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
              {currency}{totalAmount.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-slate-400 mt-0.5">
              {totalLabel}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2.5">
          {segments.map((seg, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="font-medium text-slate-700">{seg.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {seg.amount !== undefined && (
                  <span className="text-slate-400 font-medium hidden lg:inline">
                    {currency}{seg.amount.toLocaleString()}
                  </span>
                )}
                <span className="font-bold text-slate-900">{seg.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {onViewAll && (
        <div className="pt-3 mt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
          >
            View details →
          </button>
        </div>
      )}
    </div>
  );
};
