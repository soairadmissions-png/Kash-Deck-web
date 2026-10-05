import React, { useState } from 'react';
import { X, Truck, CheckCircle2 } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

interface RecordPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordPurchaseModal: React.FC<RecordPurchaseModalProps> = ({ isOpen, onClose }) => {
  const { suppliers, products, recordBusinessPurchase } = useFinancial();

  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [productId, setProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(50);
  const [unitCost, setUnitCost] = useState<number>(products[0]?.cost_price || 5000);
  const [paymentOption, setPaymentOption] = useState<'paid' | 'partial' | 'unpaid'>('unpaid');
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const selectedSupplier = suppliers.find(s => s.id === supplierId) || suppliers[0];
  const selectedProduct = products.find(p => p.id === productId) || products[0];

  const totalCost = (Number(unitCost) || 0) * (Number(quantity) || 0);

  let paidAmount = 0;
  if (paymentOption === 'paid') paidAmount = totalCost;
  else if (paymentOption === 'partial') paidAmount = Math.min(totalCost, Number(partialAmount) || 0);

  const outstandingAmount = Math.max(0, totalCost - paidAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity <= 0) return;

    recordBusinessPurchase({
      business_id: 'biz-01',
      supplier_id: supplierId,
      supplier_name: selectedSupplier?.name,
      subtotal: totalCost,
      total: totalCost,
      paid_amount: paidAmount,
      outstanding_amount: outstandingAmount,
      status: outstandingAmount === 0 ? 'paid' : paidAmount > 0 ? 'partially_paid' : 'unpaid',
      purchase_date: new Date().toISOString().split('T')[0],
      notes,
      items: [
        {
          id: `pi-${Date.now()}`,
          purchase_id: '',
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          quantity,
          unit_cost: unitCost,
          line_total: totalCost
        }
      ]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-150 space-y-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Inventory Purchase</h3>
              <p className="text-[11px] text-slate-500">Increases stock quantity and records supplier payables.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Supplier / Vendor</label>
            <select
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (Owed: ₦{s.amountOwed.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Product to Restock</label>
              <select
                value={productId}
                onChange={e => {
                  setProductId(e.target.value);
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p) setUnitCost(p.cost_price);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium truncate"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-center"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Unit Cost Price (₦)</label>
            <input
              type="number"
              value={unitCost}
              onChange={e => setUnitCost(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600">Total Purchase Cost:</span>
            <span className="text-base font-extrabold text-slate-900">₦{totalCost.toLocaleString()}</span>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Settlement Status</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentOption('paid')}
                className={`py-2 rounded-xl font-bold text-xs border ${
                  paymentOption === 'paid' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200'
                }`}
              >
                Paid in full
              </button>
              <button
                type="button"
                onClick={() => setPaymentOption('partial')}
                className={`py-2 rounded-xl font-bold text-xs border ${
                  paymentOption === 'partial' ? 'bg-amber-700 text-white border-amber-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                Partially paid
              </button>
              <button
                type="button"
                onClick={() => setPaymentOption('unpaid')}
                className={`py-2 rounded-xl font-bold text-xs border ${
                  paymentOption === 'unpaid' ? 'bg-rose-700 text-white border-rose-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                Unpaid (Payable)
              </button>
            </div>
          </div>

          {paymentOption === 'partial' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Amount Paid Now (₦)</label>
              <input
                type="number"
                value={partialAmount}
                onChange={e => setPartialAmount(e.target.value)}
                placeholder="Deposit amount"
                className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold"
              />
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Batch #490 with receipt"
              className="w-full p-2 rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Record Purchase & Increase Stock
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
