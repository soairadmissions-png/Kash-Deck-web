import React, { useState } from 'react';
import {
  Home,
  CreditCard,
  Briefcase,
  Target,
  LineChart,
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
  ChevronDown,
  CheckCircle2,
  Plus,
  User,
  Building2,
  LogOut,
  MoreHorizontal,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { WorkspaceDTO } from '../../services/apiV1';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface WorkspaceShellProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onAddNewWorkspace: (type: 'personal' | 'business') => void;
  children: React.ReactNode;
}

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({
  currentScreen,
  onNavigate,
  onAddNewWorkspace,
  children
}) => {
  const { user, activeWorkspace, workspaces, switchActiveWorkspace, logout } = useAuth();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  const isBusiness = activeWorkspace?.type === 'business';

  // Navigation configuration per workspace type
  const personalNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: PiggyBank },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'savings', label: 'Savings Vaults', icon: Landmark },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'insights', label: 'CashDeck AI', icon: LineChart }
  ];

  const businessNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'sales', label: 'Sales Ledger', icon: ShoppingBag },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'reports', label: 'P&L Statements', icon: FileSpreadsheet },
    { id: 'insights', label: 'Business AI', icon: LineChart }
  ];

  const activeNavItems = isBusiness ? businessNavItems : personalNavItems;

  // Mobile bottom bar items (top 4 + More)
  const mobileBottomItems = activeNavItems.slice(0, 4);

  const handleSelectWorkspace = async (wsId: string) => {
    setIsSwitcherOpen(false);
    if (wsId !== activeWorkspace?.id) {
      await switchActiveWorkspace(wsId);
      onNavigate('overview');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#edf4f0] text-slate-800">
      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex w-64 flex-col bg-[#f0f6f2] border-r border-emerald-950/10 p-4 shrink-0 justify-between select-none">
        <div className="space-y-4">
          {/* Brand Logo & Workspace Switcher Header */}
          <div className="relative">
            <button
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className="w-full p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold shadow-xs ${
                    isBusiness
                      ? 'bg-gradient-to-tr from-teal-700 to-emerald-600'
                      : 'bg-gradient-to-tr from-[#047857] to-[#10b981]'
                  }`}
                >
                  {isBusiness ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {activeWorkspace?.name || (isBusiness ? 'Business Desk' : 'Personal Desk')}
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
                    {isBusiness ? 'Business Workspace' : 'Personal Workspace'}
                  </span>
                </div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform shrink-0 ${
                  isSwitcherOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Workspace Switcher Dropdown */}
            {isSwitcherOpen && (
              <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in">
                <p className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Workspace
                </p>

                <div className="max-h-56 overflow-y-auto px-1.5 space-y-0.5">
                  {workspaces.map(ws => {
                    const isCurrent = ws.id === activeWorkspace?.id;
                    const wsIsBiz = ws.type === 'business';
                    return (
                      <button
                        key={ws.id}
                        onClick={() => handleSelectWorkspace(ws.id)}
                        className={`w-full p-2 rounded-xl text-left text-xs transition-all flex items-center justify-between ${
                          isCurrent
                            ? 'bg-emerald-50 text-emerald-950 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {wsIsBiz ? (
                            <Building2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          )}
                          <span className="truncate">{ws.name}</span>
                        </div>
                        {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 px-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsSwitcherOpen(false);
                      onAddNewWorkspace('business');
                    }}
                    className="w-full py-1.5 px-2 text-left text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add a Business</span>
                  </button>

                  {!workspaces.some(w => w.type === 'personal') && (
                    <button
                      onClick={() => {
                        setIsSwitcherOpen(false);
                        onAddNewWorkspace('personal');
                      }}
                      className="w-full py-1.5 px-2 text-left text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Personal Desk</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Primary Navigation List */}
          <nav className="space-y-1">
            {activeNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-emerald-950 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Sign Out */}
        <div className="pt-4 border-t border-emerald-950/10 space-y-2">
          <div className="flex items-center justify-between px-2">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-950/5 flex items-center justify-between bg-[#edf4f0]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
              >
                <span>{activeWorkspace?.name}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="hidden sm:inline-block text-xs font-semibold text-emerald-900 capitalize px-2.5 py-1 rounded-full bg-emerald-100">
              {isBusiness ? 'Business Workspace' : 'Personal Workspace'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden md:inline">
              Signed in as <strong className="text-slate-800">{user?.name}</strong>
            </span>
          </div>
        </header>

        {/* Screen View */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 transition-all">
          {children}
        </main>

        {/* ============================================================ */}
        {/* MOBILE BOTTOM NAVIGATION BAR */}
        {/* ============================================================ */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around z-40 shadow-lg">
          {mobileBottomItems.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive ? 'text-[#065f46] font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsMoreSheetOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-3 text-slate-400 hover:text-slate-600"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">More</span>
          </button>
        </div>

        {/* Mobile More Sheet */}
        {isMoreSheetOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-t-3xl p-6 border-t border-slate-200 max-h-[80vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  All Workspace Views
                </h3>
                <button
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {activeNavItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsMoreSheetOpen(false);
                      }}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-2xl text-left text-xs font-semibold text-slate-800 flex items-center gap-2.5 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-emerald-700" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={logout}
                  className="font-bold text-rose-600 flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
