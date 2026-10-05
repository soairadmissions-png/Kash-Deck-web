import React, { useState } from 'react';
import { X, UserPlus, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (customerId: string) => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { addCustomer } = useFinancial();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCust = {
      name: name.trim(),
      phone: phone.trim() || '+234 800 000 0000',
      email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`,
      purchasesCount: 0,
      totalSpent: 0,
      amountOwed: 0,
      lastPurchaseDate: 'None',
      notes: notes.trim(),
      status: 'Active' as const
    };

    addCustomer(newCust);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    onClose();
    if (onSuccess) {
      onSuccess(newCust.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Customer</h3>
              <p className="text-[11px] text-slate-500">Record customer contact & link future sales.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Customer / Business Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Amaka Stores, Chinedu Eze"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+234 803 000 0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  placeholder="contact@store.ng"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Notes / Delivery Address
            </label>
            <div className="relative">
              <FileText className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <textarea
                rows={2}
                placeholder="Key delivery preferences or payment terms..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-600"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs transition-colors"
            >
              Save Customer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
