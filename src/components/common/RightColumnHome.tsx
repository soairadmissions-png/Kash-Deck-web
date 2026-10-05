import React from 'react';
import {
  Car,
  Laptop,
  ShieldCheck,
  Calendar,
  Tv,
  Zap,
  ChevronRight,
  TrendingUp,
  Plus
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

interface RightColumnHomeProps {
  onAddGoal?: () => void;
}

export const RightColumnHome: React.FC<RightColumnHomeProps> = ({ onAddGoal }) => {
  const { goals, calendarEvents, setCurrentScreen, openDetail } = useFinancial();

  return (
    <div className="space-y-6">
      {/* Your Goals Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Your Goals</h3>
          <span className="text-xs font-medium text-slate-400">
            {goals.length} active
          </span>
        </div>

        <div className="space-y-4">
          {goals.slice(0, 2).map(goal => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const Icon = goal.iconName === 'Car' ? Car : goal.iconName === 'Laptop' ? Laptop : ShieldCheck;

            return (
              <div
                key={goal.id}
                onClick={() => openDetail('goal', goal)}
                className="group cursor-pointer hover:bg-slate-50/60 p-2 rounded-xl transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-800 transition-colors">
                        {goal.name}
                      </h4>
                      <span className="text-xs font-bold text-slate-700">
                        {progress}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                      <span>
                        ₦{goal.currentAmount.toLocaleString()} / ₦{goal.targetAmount.toLocaleString()}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: goal.color || '#059669'
                        }}
                      />
                    </div>

                    <p className="text-[10px] text-slate-400 mt-1">
                      Due {goal.targetDate}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('goals')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
          >
            <span>View all goals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          {onAddGoal && (
            <button
              onClick={onAddGoal}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          )}
        </div>
      </div>

      {/* Upcoming Payments Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Upcoming Payments</h3>
          <button
            onClick={() => setCurrentScreen('calendar')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3.5">
          {calendarEvents.slice(0, 3).map(event => {
            const isRent = event.title.toLowerCase().includes('rent');
            const isNetflix = event.title.toLowerCase().includes('netflix');

            return (
              <div
                key={event.id}
                onClick={() => openDetail('calendar', event)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isRent
                        ? 'bg-rose-50 text-rose-600'
                        : isNetflix
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {isRent ? (
                      <Calendar className="w-4 h-4" />
                    ) : isNetflix ? (
                      <Tv className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {event.date}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block">
                    ₦{event.amount.toLocaleString()}
                  </span>
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                      isRent
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {event.dueText || 'Scheduled'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Goals Progress Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Recent Goals Progress</h3>
          <button
            onClick={() => setCurrentScreen('goals')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {goals.slice(0, 2).map(goal => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const Icon = goal.iconName === 'Car' ? Car : Laptop;

            return (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Icon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{goal.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: goal.color || '#059669'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
