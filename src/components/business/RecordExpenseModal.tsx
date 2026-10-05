import React, { useState } from 'react';
import { X, Receipt, CheckCircle2, Link } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

interface RecordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordExpenseModal: React.FC<RecordExpenseModalProps> = ({ isOpen, onClose }) => {
  const { transactions, recordBusinessExpense } = useFinancial();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Rent & Facilities');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cash'>('bank');
  const [selectedTxId, setSelectedTxId] = useState<string>('');

  if (!isOpen) return null;

  // Unlinked bank transactions that could match this expense
  const unlinkedBankTxs = transactions.filter(
    t => t.amount < 0 && (!t.reconciliationStatus || t.reconciliationStatus === 'unreconciled')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = Number(amount);
    if (!description || numAmt <= 0) return;

    recordBusinessExpense({
      business_id: 'biz-01',
      category_id: category,
      amount: numAmt,
      description,
      payment_method: paymentMethod,
      transaction_id: selectedTxId || undefined,
      expense_date: new Date().toISOString().split('T')[0]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-150 space-y-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Business Expense</h3>
              <p className="text-[11px] text-slate-500">Record operating expense with optional bank feed link.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Expense Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Monthly electricity power bill"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Amount (₦)</label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Expense Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="Rent & Facilities">Rent & Facilities</option>
                <option value="Shipping & Delivery">Shipping & Delivery</option>
                <option value="Utilities">Utilities & Power</option>
                <option value="Telecommunications">Telecommunications & Data</option>
                <option value="Salaries & Wages">Salaries & Wages</option>
                <option value="Marketing & Promo">Marketing & Promo</option>
                <option value="Financial Charges">POS & Financial Charges</option>
                <option value="Repairs & Maintenance">Repairs & Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`py-2 rounded-xl font-bold text-xs border ${
                  paymentMethod === 'bank' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200'
                }`}
              >
                Bank Transfer / Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 rounded-xl font-bold text-xs border ${
                  paymentMethod === 'cash' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200'
                }`}
              >
                Physical Cash-on-hand
              </button>
            </div>
          </div>

          {/* Optional Bank Transaction Linking */}
          {paymentMethod === 'bank' && unlinkedBankTxs.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Link className="w-3.5 h-3.5 text-slate-600" />
                <span>Link to matching bank transaction (Prevents duplicate expense)</span>
              </div>
              <select
                value={selectedTxId}
                onChange={e => {
                  setSelectedTxId(e.target.value);
                  const matched = unlinkedBankTxs.find(t => t.id === e.target.value);
                  if (matched) {
                    setAmount(String(Math.abs(matched.amount)));
                    if (!description) setDescription(matched.description);
                  }
                }}
                className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="">None (Standalone manual entry)</option>
                {unlinkedBankTxs.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.description} — ₦{Math.abs(t.amount).toLocaleString()} ({t.accountName} • {t.date})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Record Business Expense
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
