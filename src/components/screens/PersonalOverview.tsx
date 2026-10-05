import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Target,
  Calendar,
  Compass,
  Plus,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiV1 } from '../../services/apiV1';
import { CurrencyWaveVector, SecurityPatternVector, CardFlowVector } from '../common/UiVectors';

interface PersonalOverviewProps {
  onNavigate: (screen: string) => void;
  onOpenQuickAdd?: () => void;
}

export const PersonalOverview: React.FC<PersonalOverviewProps> = ({ onNavigate, onOpenQuickAdd }) => {
  const { user, activeWorkspace } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hideBalances, setHideBalances] = useState(false);

  const loadDashboard = async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const data = await apiV1.getDashboard(activeWorkspace.id);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load personal dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [activeWorkspace?.id]);

  // Greeting based on Lagos / local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';
  const metrics = dashboardData?.metrics || {
    totalBalanceMinor: 0,
    incomeMinor: 0,
    expensesMinor: 0,
    savingsMinor: 0,
    savingsRate: 0,
    safeToSpendMinor: 0
  };

  const formatNaira = (minor: number) => {
    if (hideBalances) return '••••••';
    return `₦${(minor / 100).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here's your personal financial picture.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideBalances(!hideBalances)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-600 shadow-xs transition-colors"
          >
            {hideBalances ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{hideBalances ? 'Show Balances' : 'Hide Balances'}</span>
          </button>

          <button
            onClick={onOpenQuickAdd || (() => onNavigate('transactions'))}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Money</span>
          </button>
        </div>
      </div>

      {/* Setup Checklist (if skipped items exist) */}
      {dashboardData?.checklist && dashboardData.checklist.some((c: any) => !c.completed) && (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Finish Setting Up Your Personal CashDeck</span>
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
            {dashboardData.checklist.map((item: any) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.id === 'add_account') onNavigate('accounts');
                  else if (item.id === 'first_tx') onNavigate('transactions');
                  else if (item.id === 'create_goal') onNavigate('goals');
                }}
                className={`p-3 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                  item.completed
                    ? 'bg-white/60 border-emerald-200 text-emerald-900 opacity-60'
                    : 'bg-white border-emerald-300 text-slate-800 font-semibold shadow-2xs hover:shadow-xs'
                }`}
              >
                <span>{item.label}</span>
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 1: Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance Card */}
        <div
          onClick={() => onNavigate('accounts')}
          className="relative overflow-hidden bg-gradient-to-br from-[#065f46] to-[#047857] text-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
        >
          <div className="absolute right-0 bottom-0 w-36 h-20 pointer-events-none opacity-25">
            <CurrencyWaveVector className="text-emerald-200" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-100">Total Liquid Balance</span>
            <Wallet className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="relative z-10 my-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {formatNaira(metrics.totalBalanceMinor)}
            </h3>
          </div>
          <div className="relative z-10 flex items-center justify-between text-[11px] text-emerald-200">
            <span>Across all connected vaults</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Income Card */}
        <div
          onClick={() => onNavigate('transactions')}
          className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Income This Month</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatNaira(metrics.incomeMinor)}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Recorded actual earnings</span>
        </div>

        {/* Expenses Card */}
        <div
          onClick={() => onNavigate('transactions')}
          className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Expenses This Month</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatNaira(metrics.expensesMinor)}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Total spending & living costs</span>
        </div>

        {/* Savings Card */}
        <div
          onClick={() => onNavigate('goals')}
          className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Savings & Preserved</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <h3 className="text-2xl font-extrabold text-emerald-700 tracking-tight">
              {formatNaira(metrics.savingsMinor)}
            </h3>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Savings rate: {metrics.savingsRate}%</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* SECTION 2: Safe-To-Spend & CashDeck AI Insight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Safe-To-Spend Card */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 w-28 h-14 pointer-events-none opacity-20">
            <CardFlowVector className="text-emerald-700" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Safe To Spend
            </span>
            <h4 className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight mt-1">
              {formatNaira(metrics.safeToSpendMinor)}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Safe disposable cash for today and this week after factoring recurring obligations and active goal reserves.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-900 font-semibold">
            <span>Buffer intact</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* CashDeck AI Insight Card */}
        <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="absolute right-4 top-4 w-32 h-32 pointer-events-none opacity-10">
            <SecurityPatternVector className="text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                CashDeck Intelligence Observation
              </span>
            </div>
            <p className="text-sm sm:text-base font-medium text-emerald-50 leading-relaxed max-w-xl">
              "{dashboardData?.aiInsight || 'Loading diagnostic observations...'}"
            </p>
          </div>
          <div className="relative z-10 mt-4 flex items-center justify-between pt-3 border-t border-emerald-700/50 text-xs">
            <span className="text-emerald-300">Grounded in verified transaction records</span>
            <button
              onClick={() => onNavigate('insights')}
              className="text-white font-bold hover:underline flex items-center gap-1"
            >
              <span>View Full Diagnostic</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: Spending Breakdown & Goals Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Where Your Money Went */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Where your money went
              </h3>
              <p className="text-xs text-slate-400">Monthly category breakdown</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              View All
            </button>
          </div>

          {dashboardData?.spendingBreakdown && dashboardData.spendingBreakdown.length > 0 ? (
            <div className="space-y-3 pt-1">
              {dashboardData.spendingBreakdown.map((item: any) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.category}</span>
                    <span className="text-slate-900">{formatNaira(item.amountMinor)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No expenses recorded this month yet. Use "+ Record Money" to start tracking.
            </div>
          )}
        </div>

        {/* Goals Progress */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Active Financial Goals
              </h3>
              <p className="text-xs text-slate-400">Target milestones and reserves</p>
            </div>
            <button
              onClick={() => onNavigate('goals')}
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              Manage Goals
            </button>
          </div>

          {dashboardData?.goals && dashboardData.goals.length > 0 ? (
            <div className="space-y-3 pt-1">
              {dashboardData.goals.map((goal: any) => {
                const percent = Math.min(
                  100,
                  Math.round((goal.currentAmountMinor / Math.max(1, goal.targetAmountMinor)) * 100)
                );
                return (
                  <div
                    key={goal.id}
                    onClick={() => onNavigate('goals')}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{goal.name}</span>
                      <span className="text-emerald-800">
                        {formatNaira(goal.currentAmountMinor)} / {formatNaira(goal.targetAmountMinor)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#047857] rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Target: {goal.targetDate}</span>
                      <span className="font-semibold text-emerald-700">{percent}% achieved</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>No active goals yet.</p>
              <button
                onClick={() => onNavigate('goals')}
                className="mt-2 text-xs font-bold text-emerald-800 hover:underline"
              >
                + Create your first goal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
