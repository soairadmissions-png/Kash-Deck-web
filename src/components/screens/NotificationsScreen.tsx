import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  ChevronRight,
  TrendingUp,
  Target,
  CreditCard,
  Info,
  Calendar,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setCurrentScreen
  } = useFinancial();

  const [activeTab, setActiveTab] = useState<'All' | 'Transactions' | 'Goals' | 'Insights' | 'System'>('All');

  const tabs = ['All', 'Transactions', 'Goals', 'Insights', 'System'] as const;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    return n.category === activeTab;
  });

  const getNotifIcon = (type: string, category: string) => {
    switch (category) {
      case 'Transactions':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'Goals':
        return <Target className="w-4 h-4 text-emerald-600" />;
      case 'Insights':
        return <TrendingUp className="w-4 h-4 text-sky-600" />;
      case 'System':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getNotifIconBg = (category: string) => {
    switch (category) {
      case 'Transactions':
        return 'bg-emerald-50';
      case 'Goals':
        return 'bg-emerald-50';
      case 'Insights':
        return 'bg-sky-50';
      case 'System':
        return 'bg-purple-50';
      default:
        return 'bg-slate-50';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Calm, timely updates regarding your cash, goals, bills, and accounts.
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-colors"
        >
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Pill Filter Tabs matching screenshot */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-[#047857] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/70 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification List matching screenshot */}
      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotifications.map(item => (
          <div
            key={item.id}
            onClick={() => {
              markNotificationRead(item.id);
              if (item.category === 'Transactions') setCurrentScreen('transactions');
              else if (item.category === 'Goals') setCurrentScreen('goals');
              else if (item.category === 'Insights') setCurrentScreen('insights');
            }}
            className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
              item.isRead ? 'hover:bg-slate-50/70' : 'bg-emerald-50/30 hover:bg-emerald-50/60'
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={`w-10 h-10 rounded-full ${getNotifIconBg(
                  item.category
                )} flex items-center justify-center shrink-0`}
              >
                {getNotifIcon(item.type, item.category)}
              </div>

              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-right">
                <span className="text-[11px] text-slate-400 font-medium">
                  {item.time}
                </span>
                {!item.isRead && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
