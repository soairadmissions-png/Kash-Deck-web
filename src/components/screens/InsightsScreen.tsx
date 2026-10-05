import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { SecurityPatternVector, CurrencyWaveVector } from '../common/UiVectors';

export const InsightsScreen: React.FC = () => {
  const { insights, setCurrentScreen } = useFinancial();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Financial Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Objective diagnostic observations explaining what changed, the evidence behind it, and what actions to take.
        </p>
      </div>

      {/* Structured Insight Cards: What happened, Evidence, Explanation, Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map(item => {
          const isUrgent = item.impact === 'urgent';
          const isPositive = item.impact === 'positive';
          const isWarning = item.impact === 'warning';

          return (
            <div
              key={item.id}
              className="relative overflow-hidden bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5"
            >
              <div className="absolute right-0 bottom-0 w-36 h-20 pointer-events-none opacity-15">
                <CurrencyWaveVector className={isUrgent ? 'text-rose-600' : isPositive ? 'text-emerald-600' : 'text-amber-600'} />
              </div>
              <div className="relative z-10">
                {/* Top Badge & Date */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      isUrgent
                        ? 'bg-rose-100 text-rose-800'
                        : isPositive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isUrgent && <AlertTriangle className="w-3.5 h-3.5" />}
                    {isPositive && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {isWarning && <TrendingUp className="w-3.5 h-3.5" />}
                    <span className="capitalize">{item.category} Insight</span>
                  </span>

                  <span className="text-xs font-medium text-slate-400">
                    {item.date}
                  </span>
                </div>

                {/* Insight Title */}
                <h3 className="text-base font-extrabold text-slate-900 mt-3.5">
                  {item.title}
                </h3>

                {/* Structured Breakdown Blocks */}
                <div className="mt-4 space-y-3 text-xs">
                  {/* What Happened */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      1. What Happened
                    </span>
                    <p className="text-slate-800 font-semibold mt-0.5">
                      {item.whatHappened}
                    </p>
                  </div>

                  {/* Evidence */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      2. Evidence
                    </span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">
                      {item.evidence}
                    </p>
                  </div>

                  {/* Explanation */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      3. Why It Occurred
                    </span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>

                  {/* Recommendation */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-[11px] uppercase tracking-wider">Recommended Action</span>
                    </div>
                    <p className="text-emerald-950 font-medium mt-1 leading-relaxed">
                      {item.recommendation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    if (item.category === 'business') setCurrentScreen('business');
                    else if (item.category === 'savings') setCurrentScreen('goals');
                    else setCurrentScreen('money');
                  }}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
                >
                  <span>Review related ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
