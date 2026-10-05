import React from 'react';
import { Calendar, AlertCircle, TrendingUp, ChevronRight, Bell } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { CardFlowVector } from './UiVectors';

export const AlertBanner: React.FC = () => {
  const { setCurrentScreen, openDetail, calendarEvents, customers, insights } = useFinancial();

  const handleAlert1 = () => {
    const rentEvent = calendarEvents.find(c => c.title.toLowerCase().includes('rent'));
    if (rentEvent) {
      openDetail('calendar', rentEvent);
    } else {
      setCurrentScreen('calendar');
    }
  };

  const handleAlert2 = () => {
    const funke = customers.find(c => c.name.toLowerCase().includes('funke'));
    if (funke) {
      openDetail('customer', funke);
    } else {
      setCurrentScreen('customers');
    }
  };

  const handleAlert3 = () => {
    const transportInsight = insights.find(i => i.title.toLowerCase().includes('transport'));
    if (transportInsight) {
      openDetail('insight', transportInsight);
    } else {
      setCurrentScreen('insights');
    }
  };

  return (
    <div className="my-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
          <Bell className="w-3 h-3 text-emerald-800" />
        </div>
        <h4 className="text-xs font-bold text-slate-800 tracking-wide">
          CashDeck has something for you
        </h4>
      </div>

      {/* 3 Alert Cards matching screenshot exactly */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 1: Rent */}
        <div
          onClick={handleAlert1}
          className="bg-white rounded-2xl p-4 border border-slate-200/70 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                Rent is due in 4 days
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ₦2,400,000 · Due Oct 3
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Card 2: You owe Fun */}
        <div
          onClick={handleAlert2}
          className="bg-white rounded-2xl p-4 border border-slate-200/70 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                You owe Fun ₦20,000
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                You asked me to remind you today
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Card 3: Transport spending */}
        <div
          onClick={handleAlert3}
          className="bg-white rounded-2xl p-4 border border-slate-200/70 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                Transport spending is up 22%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Compared to last month
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};
