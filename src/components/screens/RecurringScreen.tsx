import React, { useState } from 'react';
import { Plus, Calendar, Clock, CheckCircle2, ChevronRight, Tv } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const RecurringScreen: React.FC = () => {
  const { recurringExpenses, accounts, addRecurringExpense } = useFinancial();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'Monthly' | 'Weekly' | 'Yearly'>('Monthly');
  const [nextPaymentDate, setNextPaymentDate] = useState('2026-10-15');
  const [category, setCategory] = useState('Subscriptions');
  const [accountName, setAccountName] = useState(accounts[0]?.name || 'GTBank');

  const totalMonthlyCommitment = recurringExpenses.reduce((s, r) => {
    if (r.frequency === 'Monthly') return s + r.amount;
    if (r.frequency === 'Weekly') return s + r.amount * 4;
    return s + Math.round(r.amount / 12);
  }, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!name || isNaN(amt)) return;

    addRecurringExpense({
      name,
      amount: amt,
      frequency,
      nextPaymentDate,
      category,
      status: 'Active',
      accountName,
      iconBg: '#e0f2fe'
    });

    setName('');
    setAmount('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Recurring Expenses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Subscriptions, bills, and fixed obligations tracked before they hit your balance.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recurring Bill</span>
        </button>
      </div>

      {/* Monthly Recurring Commitment Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Total Monthly Commitment
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
            ₦{totalMonthlyCommitment.toLocaleString()}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Across {recurringExpenses.length} regular services and subscriptions
          </p>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 text-xs text-emerald-900 font-medium">
          Automated alerts will notify you 3 days before any deduction.
        </div>
      </div>

      {/* Recurring Expenses Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 text-slate-400 font-semibold border-b border-slate-100">
                <th className="py-3 px-4">Expense Name</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4">Next Payment</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recurringExpenses.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-800"
                        style={{ backgroundColor: rec.iconBg || '#dcfce7' }}
                      >
                        {rec.name.slice(0, 1)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{rec.name}</p>
                        <p className="text-[11px] text-slate-400">{rec.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₦{rec.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {rec.frequency}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {rec.nextPaymentDate}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {rec.accountName}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.status === 'Due Soon'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      • {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Recurring Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Recurring Bill</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expense Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DSTV Premium, Office Internet"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount (₦)</label>
                <input
                  type="number"
                  required
                  placeholder="25000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Next Payment</label>
                  <input
                    type="date"
                    required
                    value={nextPaymentDate}
                    onChange={e => setNextPaymentDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Paid From</label>
                <select
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.name}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#047857] hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  Save Recurring Bill
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
