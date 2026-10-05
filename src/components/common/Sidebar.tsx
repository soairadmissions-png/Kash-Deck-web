import React from 'react';
import {
  Home,
  CreditCard,
  Briefcase,
  Target,
  MoreHorizontal,
  Landmark,
  Receipt,
  PiggyBank,
  Calendar,
  ShoppingBag,
  Package,
  Users,
  Truck,
  TrendingUp,
  FileSpreadsheet,
  Bell,
  Settings,
  ShieldCheck,
  ChevronRight,
  Compass
} from 'lucide-react';
import { useFinancial, ScreenType } from '../../context/FinancialContext';

interface SidebarProps {
  onOpenOnboarding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenOnboarding }) => {
  const { currentScreen, setCurrentScreen, unreadNotificationsCount } = useFinancial();
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  const mainNavItems = [
    { id: 'home' as ScreenType, label: 'Home', icon: Home },
    { id: 'money' as ScreenType, label: 'Money', icon: CreditCard },
    { id: 'business' as ScreenType, label: 'Business', icon: Briefcase },
    { id: 'goals' as ScreenType, label: 'Goals', icon: Target },
    { id: 'insights' as ScreenType, label: 'Insights', icon: Compass }
  ];

  const moreNavItems = [
    { id: 'accounts' as ScreenType, label: 'Accounts', icon: Landmark, desc: 'Connected banks & cash' },
    { id: 'transactions' as ScreenType, label: 'Transactions', icon: Receipt, desc: 'Activity ledger' },
    { id: 'budgets' as ScreenType, label: 'Budgets', icon: PiggyBank, desc: 'Monthly spending limits' },
    { id: 'recurring' as ScreenType, label: 'Recurring Expenses', icon: Calendar, desc: 'Bills & subscriptions' },
    { id: 'calendar' as ScreenType, label: 'Financial Calendar', icon: Calendar, desc: 'Upcoming cash events' },
    { id: 'sales' as ScreenType, label: 'Sales Ledger', icon: ShoppingBag, desc: 'Customer sales & receipts' },
    { id: 'inventory' as ScreenType, label: 'Inventory', icon: Package, desc: 'Stock & unit costs' },
    { id: 'customers' as ScreenType, label: 'Customers', icon: Users, desc: 'Buyers & receivables' },
    { id: 'suppliers' as ScreenType, label: 'Suppliers', icon: Truck, desc: 'Vendors & payables' },
    { id: 'investments' as ScreenType, label: 'Investments', icon: TrendingUp, desc: 'Portfolio tracking' },
    { id: 'reports' as ScreenType, label: 'Reports', icon: FileSpreadsheet, desc: 'P&L and export center' },
    { id: 'providers' as ScreenType, label: 'Bank Connections', icon: ShieldCheck, desc: 'Link Nigerian accounts' },
    {
      id: 'notifications' as ScreenType,
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      desc: 'Alerts & updates'
    },
    { id: 'settings' as ScreenType, label: 'Settings', icon: Settings, desc: 'Preferences & security' }
  ];

  const isMoreActive = moreNavItems.some(item => item.id === currentScreen);

  return (
    <aside className="w-64 bg-[#f8faf9] border-r border-emerald-950/5 flex flex-col justify-between p-5 select-none shrink-0 min-h-screen">
      <div>
        {/* Brand Logo */}
        <div
          onClick={() => setCurrentScreen('home')}
          className="flex items-center gap-2.5 px-2 py-2 mb-8 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#047857] to-[#10b981] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              <line x1="12" y1="22" x2="12" y2="15.5" />
              <polyline points="22 8.5 12 15.5 2 8.5" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-emerald-950">CashDeck</span>
        </div>

        {/* Core Navigation Items */}
        <nav className="space-y-1.5 relative">
          {mainNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentScreen(item.id);
                  setShowMoreMenu(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#dcfce7] text-[#065f46] font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-900/5'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[#065f46]' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* More Navigation Button */}
          <div className="relative pt-1">
            <button
              onClick={() => setShowMoreMenu(prev => !prev)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isMoreActive || showMoreMenu
                  ? 'bg-emerald-950/5 text-emerald-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-900/5'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <MoreHorizontal
                  className={`w-5 h-5 ${
                    isMoreActive ? 'text-[#065f46]' : 'text-slate-400'
                  }`}
                />
                <span>More</span>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  showMoreMenu ? 'rotate-90' : ''
                }`}
              />
            </button>

            {/* Expandable More Submenu */}
            {showMoreMenu && (
              <div className="mt-1.5 py-1.5 px-1 bg-white rounded-xl shadow-lg border border-slate-200/70 max-h-96 overflow-y-auto z-30 divide-y divide-slate-100">
                <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Workspaces & Tools
                </div>
                <div className="py-1">
                  {moreNavItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentScreen === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentScreen(item.id);
                          setShowMoreMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                          isActive
                            ? 'bg-[#dcfce7] text-[#065f46] font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-slate-500" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Bottom Area: Mission card (No AI / Chatbot) */}
      <div className="pt-6 space-y-3">
        {/* Onboarding trigger quicklink */}
        {onOpenOnboarding && (
          <button
            onClick={onOpenOnboarding}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Launch Onboarding Flow</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        )}

        {/* Motivational Card matching screenshot exactly:
            "Better decisions, brighter future." with a cute green sprout */}
        <div
          onClick={() => setCurrentScreen('insights')}
          className="bg-white rounded-2xl p-4 border border-emerald-900/10 shadow-xs cursor-pointer hover:border-emerald-300 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <svg
                className="w-5 h-5 fill-emerald-600"
                viewBox="0 0 24 24"
              >
                <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4 21l3.39-.97C8.93 20.26 10.88 21 13 21c4.97 0 9-4.03 9-9 0-4.97-4.03-9-9-9zm1 14.5c-3.03 0-5.5-2.47-5.5-5.5s2.47-5.5 5.5-5.5 5.5 2.47 5.5 5.5-2.47 5.5-5.5 5.5z" opacity="0.2"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="none"/>
                {/* Sprout Icon */}
                <path d="M12 22a10 10 0 0 1-10-10C2 6.48 6.48 2 12 2s10 4.48 10 10a10 10 0 0 1-10 10zm-1-7.17V17h2v-2.17c2.83-.48 5-2.94 5-5.83 0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.89 2.17 5.35 5 5.83z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 leading-tight">Better decisions,</p>
              <p className="text-xs font-semibold text-slate-800 leading-tight">brighter future.</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </aside>
  );
};
