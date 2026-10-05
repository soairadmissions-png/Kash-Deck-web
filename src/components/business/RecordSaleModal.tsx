import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { SaleStatus } from '../../types';

interface RecordSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({ isOpen, onClose }) => {
  const { customers, products, recordBusinessSale, deriveStock } = useFinancial();

  const [customerId, setCustomerId] = useState<string>('walk-in');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentStatusOption, setPaymentStatusOption] = useState<'paid' | 'partial' | 'unpaid'>('paid');
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Bank' | 'Cash' | 'POS' | 'Card' | 'Transfer'>('Transfer');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const selectedCustomer = customers.find(c => c.id === customerId);
  const currentStock = selectedProduct ? deriveStock(selectedProduct.id) : 0;

  const unitPrice = selectedProduct?.selling_price || 0;
  const costPrice = selectedProduct?.cost_price || 0;
  const subtotal = unitPrice * quantity;
  const total = Math.max(0, subtotal - discount);
  const totalCost = costPrice * quantity;
  const estimatedProfit = total - totalCost;

  let finalPaidAmount = 0;
  let status: SaleStatus = 'paid';

  if (paymentStatusOption === 'paid') {
    finalPaidAmount = total;
    status = 'paid';
  } else if (paymentStatusOption === 'partial') {
    finalPaidAmount = Math.min(total, Number(partialAmount) || 0);
    status = finalPaidAmount === 0 ? 'unpaid' : 'partially_paid';
  } else {
    finalPaidAmount = 0;
    status = 'unpaid';
  }

  const outstandingAmount = Math.max(0, total - finalPaidAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity <= 0) return;

    recordBusinessSale({
      business_id: 'biz-01',
      customer_id: customerId === 'walk-in' ? undefined : customerId,
      customer_name: customerId === 'walk-in' ? 'Walk-in Customer' : selectedCustomer?.name,
      subtotal,
      discount,
      total,
      paid_amount: finalPaidAmount,
      outstanding_amount: outstandingAmount,
      status,
      payment_method: paymentStatusOption === 'unpaid' ? 'Credit sale' : paymentMethod,
      sale_date: new Date().toISOString().split('T')[0],
      notes,
      items: [
        {
          id: `si-${Date.now()}`,
          sale_id: '',
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          quantity,
          unit_price: unitPrice,
          cost_price: costPrice,
          line_total: subtotal
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
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Business Sale</h3>
              <p className="text-[11px] text-slate-500">Automatically links inventory, cash, customer and profit.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Step 1: Customer */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Step 1: Customer</label>
            <select
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
            >
              <option value="walk-in">Walk-in Customer (No debt tracking)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.amountOwed > 0 ? `(Owes ₦${c.amountOwed.toLocaleString()})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Product & Quantity */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">Step 2: Product & Quantity</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium truncate"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₦{p.selling_price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-center"
                  placeholder="Qty"
                />
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 px-1">
              <span>Unit price: ₦{unitPrice.toLocaleString()} (Cost: ₦{costPrice.toLocaleString()})</span>
              <span className={currentStock <= 5 ? 'text-amber-700 font-bold' : 'text-slate-600'}>
                Stock available: {currentStock} units
              </span>
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Discount (₦)</label>
            <input
              type="number"
              min="0"
              value={discount || ''}
              onChange={e => setDiscount(Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium"
            />
          </div>

          {/* Live Financial Summary */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal ({quantity} units):</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-900 border-t border-emerald-200/50 pt-1">
              <span>Total Payable:</span>
              <span className="text-base text-emerald-900 font-extrabold">₦{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-700 pt-0.5">
              <span>Estimated Gross Profit:</span>
              <span className="font-bold">₦{estimatedProfit.toLocaleString()}</span>
            </div>
          </div>

          {/* Step 3: Payment Status */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Step 3: Payment Status</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentStatusOption('paid')}
                className={`py-2 rounded-xl font-bold transition-all text-xs border ${
                  paymentStatusOption === 'paid'
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Paid in full
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatusOption('partial')}
                className={`py-2 rounded-xl font-bold transition-all text-xs border ${
                  paymentStatusOption === 'partial'
                    ? 'bg-amber-700 text-white border-amber-700'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Partially paid
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatusOption('unpaid')}
                className={`py-2 rounded-xl font-bold transition-all text-xs border ${
                  paymentStatusOption === 'unpaid'
                    ? 'bg-rose-700 text-white border-rose-700'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Unpaid / Credit
              </button>
            </div>
          </div>

          {/* If partial: amount paid */}
          {paymentStatusOption === 'partial' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Amount Paid Now (₦)</label>
              <input
                type="number"
                value={partialAmount}
                onChange={e => setPartialAmount(e.target.value)}
                placeholder="Enter deposit amount"
                className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold"
                required
              />
              <span className="text-[11px] text-amber-800 block mt-1">
                Outstanding receivable balance: ₦{(total - (Number(partialAmount) || 0)).toLocaleString()}
              </span>
            </div>
          )}

          {/* Step 4: Payment Method */}
          {paymentStatusOption !== 'unpaid' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Step 4: Payment Method</label>
              <div className="grid grid-cols-4 gap-2">
                {(['Transfer', 'Cash', 'POS', 'Card'] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border ${
                      paymentMethod === method
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Notes / Description (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Delivered with invoice"
              className="w-full p-2 rounded-xl border border-slate-200 bg-white"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Save Sale & Update Books
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
