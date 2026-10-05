import React, { useState } from 'react';
import { X, Wallet, ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

interface CashManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'sale' | 'expense';
}

export const CashManagementModal: React.FC<CashManagementModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'sale'
}) => {
  const { products, recordCashSale, recordCashExpense, cashOnHand } = useFinancial();

  const [mode, setMode] = useState<'sale' | 'expense'>(defaultMode);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [expenseCategory, setExpenseCategory] = useState('Operating Supplies');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = Number(amount);
    if (numAmt <= 0) return;

    if (mode === 'sale') {
      recordCashSale({
        customerName: description || 'Walk-in Cash Customer',
        productId: selectedProductId,
        quantity,
        amount: numAmt,
        notes: 'Physical cash received'
      });
    } else {
      recordCashExpense({
        categoryId: expenseCategory,
        amount: numAmt,
        description: description || 'Cash outflow',
        notes: 'Physical cash disbursed'
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-150 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Physical Cash Management</h3>
              <p className="text-[11px] text-slate-500">Current Cash on Hand: ₦{cashOnHand.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('sale')}
            className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'sale' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>Record Cash Sale</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('expense')}
            className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'expense' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
            <span>Record Cash Expense</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Cash Amount (₦)
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-extrabold text-base"
              required
            />
          </div>

          {mode === 'sale' ? (
            <>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Sold</label>
                <select
                  value={selectedProductId}
                  onChange={e => {
                    setSelectedProductId(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod) setAmount(String(prod.selling_price * quantity));
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₦{p.selling_price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => {
                      const q = Math.max(1, parseInt(e.target.value) || 1);
                      setQuantity(q);
                      const prod = products.find(p => p.id === selectedProductId);
                      if (prod) setAmount(String(prod.selling_price * q));
                    }}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Customer / Narrative</label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. Walk-in buyer"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Expense Category</label>
                <select
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="Operating Supplies">Operating Supplies</option>
                  <option value="Transportation / Fare">Transportation / Fare</option>
                  <option value="Daily Refreshments">Daily Refreshments</option>
                  <option value="Packaging & Bags">Packaging & Bags</option>
                  <option value="Generator Fuel">Generator Fuel</option>
                  <option value="Minor Repairs">Minor Repairs</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Expense Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. 10 Liters Fuel for store generator"
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                  required
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="submit"
              className={`flex-1 py-2.5 text-white rounded-xl text-xs font-bold shadow-xs transition-colors ${
                mode === 'sale' ? 'bg-[#047857] hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
              }`}
            >
              {mode === 'sale' ? 'Record Cash Sale (+Cash on Hand)' : 'Record Cash Expense (-Cash on Hand)'}
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
