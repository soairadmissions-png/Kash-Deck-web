import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, DollarSign, Clock } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const CalendarScreen: React.FC = () => {
  const { calendarEvents, openDetail } = useFinancial();

  const [currentMonth, setCurrentMonth] = useState('October 2026');

  // Days in October 2026: 31 days. Oct 1 is Thursday.
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const getEventsForDay = (day: number) => {
    return calendarEvents.filter(e => e.dayOfMonth === day);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Financial Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cash events, bill due dates, and expected receivables by day.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
          <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 px-2">{currentMonth}</span>
          <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-xs overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 text-center py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Grid: Thursday start = 4 blank days (Sun, Mon, Tue, Wed) */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
          {[null, null, null, null].map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[105px] bg-slate-50/30 p-2" />
          ))}

          {daysInMonth.map(day => {
            const events = getEventsForDay(day);
            const isToday = day === 2; // local date Oct 2, 2026

            return (
              <div
                key={day}
                className={`min-h-[105px] p-2 transition-colors flex flex-col justify-between ${
                  isToday ? 'bg-emerald-50/30 ring-1 ring-emerald-500/30 inset-0' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isToday
                        ? 'bg-emerald-700 text-white'
                        : 'text-slate-700'
                    }`}
                  >
                    {day}
                  </span>
                  {events.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>

                {/* Event badges */}
                <div className="space-y-1 mt-1">
                  {events.map(ev => {
                    const isIncome = ev.type === 'income';
                    const isRent = ev.title.toLowerCase().includes('rent');

                    return (
                      <div
                        key={ev.id}
                        onClick={() => openDetail('calendar', ev)}
                        className={`px-1.5 py-1 rounded text-[10px] font-semibold cursor-pointer truncate transition-transform hover:scale-[1.02] ${
                          isIncome
                            ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300'
                            : isRent
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                        title={`${ev.title}: ₦${ev.amount.toLocaleString()}`}
                      >
                        {ev.title} • ₦{Math.round(ev.amount / 1000)}k
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span>Expected Inflows & Salary</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
          <span>Housing & High-Value Rent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Bills & Supplier Settlements</span>
        </div>
      </div>
    </div>
  );
};
