import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Plus,
  Landmark,
  ShoppingBag,
  Smartphone,
  Tag,
  FileText,
  Calendar
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { HeroBalanceCard } from '../common/HeroBalanceCard';
import { MetricCard } from '../common/MetricCard';
import { AlertBanner } from '../common/AlertBanner';
import { DonutChart } from '../common/DonutChart';
import { CashFlowBarChart } from '../common/CashFlowBarChart';
import { RightColumnHome } from '../common/RightColumnHome';

export const HomeScreen: React.FC = () => {
  const {
    personalMetrics,
    transactions,
    setCurrentScreen,
    openDetail
  } = useFinancial();

  // Spending donut categories matching screenshot
  const spendingSegments = [
    { label: 'Transport', percentage: 32, amount: 134400, color: '#0d9488' },
    { label: 'Food & Dining', percentage: 22, amount: 92400, color: '#10b981' },
    { label: 'Shopping', percentage: 16, amount: 67200, color: '#8b5cf6' },
    { label: 'Bills & Utilities', percentage: 12, amount: 50400, color: '#f59e0b' },
    { label: 'Others', percentage: 18, amount: 75600, color: '#64748b' }
  ];

  const getTransactionIcon = (category: string, type: string) => {
    switch (category.toLowerCase()) {
      case 'income':
        return <Landmark className="w-4 h-4 text-emerald-600" />;
      case 'groceries':
      case 'food & dining':
        return <ShoppingBag className="w-4 h-4 text-rose-600" />;
      case 'personal':
      case 'telecom':
        return <Smartphone className="w-4 h-4 text-sky-600" />;
      case 'sales':
      case 'receivable':
        return <Tag className="w-4 h-4 text-purple-600" />;
      case 'business':
      case 'inventory':
        return <FileText className="w-4 h-4 text-amber-600" />;
      default:
        return type === 'income' ? (
          <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
        ) : (
          <ArrowUpRight className="w-4 h-4 text-slate-600" />
        );
    }
  };

  const getIconBg = (category: string) => {
    switch (category.toLowerCase()) {
      case 'income':
        return 'bg-emerald-50';
      case 'groceries':
      case 'food & dining':
        return 'bg-rose-50';
      case 'personal':
        return 'bg-sky-50';
      case 'sales':
      case 'receivable':
        return 'bg-purple-50';
      case 'business':
      case 'inventory':
        return 'bg-amber-50';
      default:
        return 'bg-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Good morning, Ada</span>
          <span className="text-2xl animate-bounce">👋</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Here's what's happening with your finances today.
        </p>
      </div>

      {/* Main Grid: 2-column or 3-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left & Center Main Content Area */}
        <div className="xl:col-span-2 space-y-6">
          {/* Top Metric Cards Row: Hero Card + 3 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <HeroBalanceCard
                title="Total Balance"
                amount={personalMetrics.totalBalance}
                percentageChange="12% vs last month"
              />
            </div>
            <MetricCard
              title="Income"
              amount={personalMetrics.income}
              type="income"
              subtext="This month"
              onClick={() => setCurrentScreen('transactions')}
            />
            <MetricCard
              title="Expenses"
              amount={personalMetrics.expenses}
              type="expense"
              subtext="This month"
              onClick={() => setCurrentScreen('transactions')}
            />
            <MetricCard
              title="Savings"
              amount={personalMetrics.savings}
              type="savings"
              subtext="This month"
              onClick={() => setCurrentScreen('goals')}
            />
          </div>

          {/* CashDeck has something for you (Alert Banner) */}
          <AlertBanner />

          {/* Recent Activity Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
              <button
                onClick={() => setCurrentScreen('transactions')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {transactions.slice(0, 5).map(tx => (
                <div
                  key={tx.id}
                  onClick={() => openDetail('transaction', tx)}
                  className="py-3 px-2 rounded-xl hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${getIconBg(
                        tx.category
                      )} flex items-center justify-center shrink-0`}
                    >
                      {getTransactionIcon(tx.category, tx.type)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {tx.description}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {tx.category} • {tx.isBusiness ? 'Business' : 'Personal'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-bold block ${
                        tx.amount > 0 ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {tx.amount > 0 ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {tx.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Charts: Spending Overview Donut & Cash Flow Bar Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DonutChart
              title="Spending Overview"
              totalLabel="Total Spent"
              totalAmount={personalMetrics.expenses}
              segments={spendingSegments}
              onViewAll={() => setCurrentScreen('budgets')}
            />
            <CashFlowBarChart
              title="Cash Flow"
              primaryLabel="Income"
              secondaryLabel="Expenses"
            />
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="xl:col-span-1">
          <RightColumnHome onAddGoal={() => setCurrentScreen('goals')} />
        </div>
      </div>
    </div>
  );
};
