import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const CustomersScreen: React.FC = () => {
  const { customers, openDetail, recordCustomerPayment, accounts, addCustomer } = useFinancial();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalOwed = customers.reduce((s, c) => s + c.amountOwed, 0);
  const totalCustomerSpend = customers.reduce((s, c) => s + c.totalSpent, 0);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addCustomer({
      name,
      phone: phone || '+234 800 000 0000',
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      purchasesCount: 0,
      totalSpent: 0,
      amountOwed: 0,
      lastPurchaseDate: 'None',
      notes,
      status: 'Active'
    });

    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Customers & Receivables
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Buyer purchase history, contact ledger and outstanding debt balances.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total Receivables (Owed)</span>
          <p className="text-2xl font-bold text-rose-700 mt-1">
            ₦{totalOwed.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Money expected from buyers
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Customer Lifetime Purchases</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₦{totalCustomerSpend.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Cumulative sales value
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Active Clients</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {customers.length} profiles
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            With tracked purchasing records
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/70 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customers by name, phone, or email..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200/80 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 text-slate-400 font-semibold border-b border-slate-100">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-right">Total Spent</th>
                <th className="py-3 px-4 text-right">Amount Owed</th>
                <th className="py-3 px-4">Last Purchase</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(cust => (
                <tr
                  key={cust.id}
                  onClick={() => openDetail('customer', cust)}
                  className="hover:bg-slate-50 cursor-pointer group transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {cust.name}
                    </p>
                    {cust.notes && (
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{cust.notes}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="font-medium">{cust.phone}</p>
                    <p className="text-[11px] text-slate-400">{cust.email}</p>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                    {cust.purchasesCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    ₦{cust.totalSpent.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold">
                    {cust.amountOwed > 0 ? (
                      <span className="text-rose-600">₦{cust.amountOwed.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-400">₦0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {cust.lastPurchaseDate}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cust.amountOwed > 0
                          ? 'bg-rose-100 text-rose-800'
                          : cust.status === 'VIP'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {cust.amountOwed > 0 ? 'Due Balance' : cust.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Lawal"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+234 803 000 0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="babatunde@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Preferences, company name, discount agreements..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#047857] hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  Save Customer
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
