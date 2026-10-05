import React, { useState } from 'react';
import { Plus, PiggyBank, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const BudgetsScreen: React.FC = () => {
  const { budgets, addBudget } = useFinancial();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [limit, setLimit] = useState('');

  const totalBudgeted = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const l = parseFloat(limit);
    if (!name || isNaN(l)) return;

    addBudget({
      name,
      category,
      monthlyLimit: l,
      color: '#059669',
      iconName: 'ShoppingBag'
    });

    setName('');
    setLimit('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Budgets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monthly spending plans with visual progress indicators.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Budget</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total Monthly Budget</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₦{totalBudgeted.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Across {budgets.length} spending categories
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total Spent This Month</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₦{totalSpent.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            {Math.round((totalSpent / totalBudgeted) * 100)}% of total allocated
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Remaining to Spend</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            ₦{totalRemaining.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Safe spending buffer
          </span>
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map(b => {
          const percent = Math.min(100, Math.round((b.spent / b.monthlyLimit) * 100));
          const remaining = Math.max(0, b.monthlyLimit - b.spent);
          const isOver = b.spent > b.monthlyLimit;

          return (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      {b.name.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{b.name}</h4>
                      <p className="text-[11px] text-slate-400">{b.category}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isOver
                        ? 'bg-rose-100 text-rose-800'
                        : percent > 80
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isOver ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    <span>{isOver ? 'Exceeded' : `${percent}% on track`}</span>
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Spent</span>
                    <p className="text-xl font-bold text-slate-900">
                      ₦{b.spent.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-medium">Remaining</span>
                    <p className={`text-xl font-bold ${isOver ? 'text-rose-600' : 'text-emerald-700'}`}>
                      ₦{remaining.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-rose-600'
                        : percent > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Monthly cap: ₦{b.monthlyLimit.toLocaleString()}</span>
                <span>Resets in 28 days</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create Monthly Budget</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Budget Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Groceries & Market"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Transport">Transport</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills & Utilities">Bills & Utilities</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Monthly Limit (₦)</label>
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={limit}
                  onChange={e => setLimit(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#047857] hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  Create Budget
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
