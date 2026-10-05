import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Building2,
  Settings,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

interface NavbarProps {
  onOpenOnboarding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOnboarding }) => {
  const {
    userMode,
    setUserMode,
    currentScreen,
    setCurrentScreen,
    searchQuery,
    setSearchQuery,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    resetToDemoData,
    transactions,
    customers,
    accounts,
    inventory,
    openDetail
  } = useFinancial();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items matching search query
  const matchingTransactions = searchQuery.trim()
    ? transactions.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const matchingCustomers = searchQuery.trim()
    ? customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchingInventory = searchQuery.trim()
    ? inventory.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const hasSearchResults =
    matchingTransactions.length > 0 ||
    matchingCustomers.length > 0 ||
    matchingInventory.length > 0;

  return (
    <header className="h-16 px-6 lg:px-8 border-b border-emerald-950/5 flex items-center justify-between bg-[#edf4f0]/60 backdrop-blur-md sticky top-0 z-30">
      {/* Search Input Bar matching screenshot */}
      <div ref={searchRef} className="relative w-full max-w-md">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search anything..."
            className="w-full pl-10 pr-12 py-2 text-sm bg-white rounded-xl border border-slate-200/80 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400 text-slate-800"
          />
          <div className="absolute right-3 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 rounded border border-slate-200 pointer-events-none">
            ⌘ K
          </div>
        </div>

        {/* Live Search Quick Results Dropdown */}
        {isSearchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-40 max-h-96 overflow-y-auto">
            {hasSearchResults ? (
              <div className="divide-y divide-slate-100">
                {matchingTransactions.length > 0 && (
                  <div className="py-1">
                    <p className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Transactions
                    </p>
                    {matchingTransactions.map(tx => (
                      <div
                        key={tx.id}
                        onClick={() => {
                          openDetail('transaction', tx);
                          setIsSearchFocused(false);
                        }}
                        className="px-4 py-2 hover:bg-emerald-50/60 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{tx.description}</p>
                          <p className="text-slate-400">{tx.category} • {tx.accountName}</p>
                        </div>
                        <span className={tx.amount > 0 ? 'text-emerald-600 font-semibold' : 'text-slate-700 font-semibold'}>
                          {tx.amount > 0 ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {matchingCustomers.length > 0 && (
                  <div className="py-1">
                    <p className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Customers
                    </p>
                    {matchingCustomers.map(cust => (
                      <div
                        key={cust.id}
                        onClick={() => {
                          openDetail('customer', cust);
                          setIsSearchFocused(false);
                        }}
                        className="px-4 py-2 hover:bg-emerald-50/60 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{cust.name}</p>
                          <p className="text-slate-400">{cust.phone}</p>
                        </div>
                        <span className="text-slate-600 font-medium">₦{cust.totalSpent.toLocaleString()} spent</span>
                      </div>
                    ))}
                  </div>
                )}

                {matchingInventory.length > 0 && (
                  <div className="py-1">
                    <p className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Inventory Items
                    </p>
                    {matchingInventory.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          openDetail('inventory', item);
                          setIsSearchFocused(false);
                        }}
                        className="px-4 py-2 hover:bg-emerald-50/60 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <p className="text-slate-400">SKU: {item.sku} • Stock: {item.quantity}</p>
                        </div>
                        <span className="text-emerald-700 font-semibold">₦{item.sellingPrice.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching financial records found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifMenuOpen(prev => !prev)}
            aria-label="Notifications"
            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all shadow-xs relative"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Quick Notification Dropdown */}
          {isNotifMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Notifications
                  </h4>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full">
                      {unreadNotificationsCount} new
                    </span>
                  )}
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-medium text-emerald-700 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.slice(0, 5).map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationRead(notif.id);
                      setCurrentScreen('notifications');
                      setIsNotifMenuOpen(false);
                    }}
                    className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors flex items-start gap-2.5 ${
                      notif.isRead ? 'hover:bg-slate-50' : 'bg-emerald-50/40 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="w-2 h-2 mt-1.5 rounded-full shrink-0 bg-emerald-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {notif.description}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {notif.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setCurrentScreen('notifications');
                    setIsNotifMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors w-full py-1"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill matching screenshot exactly:
            Round avatar of Ada + "Ada" + subtext "Personal" or "Business" + chevron */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(prev => !prev)}
            className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-xs transition-all group"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Ada"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">Ada</p>
              <p className="text-[11px] text-slate-500 capitalize leading-tight">
                {userMode}
              </p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform ${
                isProfileMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Ada Okafor</p>
                <p className="text-[11px] text-slate-500">ada.okafor@cashdeck.ng</p>
              </div>

              {/* Workspace Switcher */}
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                  Active Workspace
                </p>
                <button
                  onClick={() => {
                    setUserMode('personal');
                    setCurrentScreen('home');
                    setIsProfileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    userMode === 'personal'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Personal Finance</span>
                  </div>
                  {userMode === 'personal' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setUserMode('business');
                    setCurrentScreen('business');
                    setIsProfileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors mt-0.5 ${
                    userMode === 'business'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Business Workspace</span>
                  </div>
                  {userMode === 'business' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </button>
              </div>

              {/* Quick links */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setCurrentScreen('settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account & Settings</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentScreen('providers');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Connect Financial Provider</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenOnboarding();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-emerald-800 font-medium hover:bg-emerald-50 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Launch Onboarding Flow</span>
                </button>

                <button
                  onClick={() => {
                    resetToDemoData();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
