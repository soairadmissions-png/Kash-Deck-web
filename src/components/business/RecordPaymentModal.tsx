import React, { useState } from 'react';
import { X, CreditCard, ArrowDownLeft, ArrowUpRight, DollarSign, CheckCircle2, Building, User } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'customer' | 'supplier' | 'owner';
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'customer'
}) => {
  const {
    customers,
    suppliers,
    businessSales,
    businessPurchases,
    recordCustomerPayment,
    recordSupplierPayment,
    recordOwnerContribution,
    accounts,
    cashOnHand
  } = useFinancial();

  const [paymentDirection, setPaymentDirection] = useState<'customer' | 'supplier' | 'owner'>(defaultType);

  // Customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState('');

  // Supplier state
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedPurchaseId, setSelectedPurchaseId] = useState('');

  // Common payment fields
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cash' | 'transfer'>('bank');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts.find(a => a.isBusiness)?.id || 'acc-gtb');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Selected entities & their unpaid documents
  const currentCustomer = customers.find(c => c.id === selectedCustomerId);
  const customerUnpaidSales = businessSales.filter(
    s => s.customer_id === selectedCustomerId && s.outstanding_amount > 0
  );

  const currentSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const supplierUnpaidPurchases = businessPurchases.filter(
    p => p.supplier_id === selectedSupplierId && p.outstanding_amount > 0
  );

  const handleQuickFillCustomer = (saleId: string, owedAmt: number) => {
    setSelectedSaleId(saleId);
    setAmount(owedAmt);
  };

  const handleQuickFillSupplier = (purchaseId: string, owedAmt: number) => {
    setSelectedPurchaseId(purchaseId);
    setAmount(owedAmt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payAmt = Number(amount);
    if (!payAmt || payAmt <= 0) return;

    if (paymentDirection === 'customer') {
      if (!selectedCustomerId) return;
      recordCustomerPayment({
        customerId: selectedCustomerId,
        amount: payAmt,
        method: paymentMethod,
        saleId: selectedSaleId || undefined,
        reference: reference || `RCPT-${Date.now().toString().slice(-6)}`,
        notes: notes || `Direct payment received from ${currentCustomer?.name || 'Customer'}`
      });
    } else if (paymentDirection === 'supplier') {
      if (!selectedSupplierId) return;
      recordSupplierPayment({
        supplierId: selectedSupplierId,
        amount: payAmt,
        method: paymentMethod,
        purchaseId: selectedPurchaseId || undefined,
        reference: reference || `PMT-${Date.now().toString().slice(-6)}`,
        notes: notes || `Supplier payment to ${currentSupplier?.name || 'Supplier'}`
      });
    } else {
      // Owner contribution
      recordOwnerContribution(
        payAmt,
        paymentMethod === 'cash' ? 'cash' : 'bank',
        notes || 'Owner Capital Contribution / Equity Injection'
      );
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Payment</h3>
              <p className="text-[11px] text-slate-500">
                Update customer receivables, supplier payables, or owner equity.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Payment Recorded Successfully</h4>
            <p className="text-xs text-slate-500">
              Balances, debt ledgers, and accounts updated automatically.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Direction Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentDirection('customer');
                  setAmount('');
                }}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentDirection === 'customer'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Customer Inflow</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentDirection('supplier');
                  setAmount('');
                }}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentDirection === 'supplier'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Pay Supplier</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentDirection('owner');
                  setAmount('');
                }}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentDirection === 'owner'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Owner Equity</span>
              </button>
            </div>

            {/* Customer Direction Fields */}
            {paymentDirection === 'customer' && (
              <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Select Customer *
                  </label>
                  <select
                    required
                    value={selectedCustomerId}
                    onChange={e => {
                      setSelectedCustomerId(e.target.value);
                      setSelectedSaleId('');
                      const c = customers.find(item => item.id === e.target.value);
                      if (c && c.amountOwed > 0) {
                        setAmount(c.amountOwed);
                      }
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="">Select customer receiving payment from...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.amountOwed > 0 ? `(Owes: ₦${c.amountOwed.toLocaleString()})` : '(No debt)'}
                      </option>
                    ))}
                  </select>
                </div>

                {customerUnpaidSales.length > 0 && (
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">
                      Link to Specific Unpaid Sale (optional):
                    </label>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {customerUnpaidSales.map(sale => (
                        <div
                          key={sale.id}
                          onClick={() => handleQuickFillCustomer(sale.id, sale.outstanding_amount)}
                          className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            selectedSaleId === sale.id
                              ? 'bg-emerald-50 border-emerald-500'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-slate-900">Sale #{sale.sale_number}</span>
                            <span className="text-[11px] text-slate-400 block">{sale.sale_date}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-amber-800">
                              ₦{sale.outstanding_amount.toLocaleString()} due
                            </span>
                            <span className="text-[10px] text-slate-400 block">Total: ₦{sale.total.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Supplier Direction Fields */}
            {paymentDirection === 'supplier' && (
              <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Select Supplier / Vendor *
                  </label>
                  <select
                    required
                    value={selectedSupplierId}
                    onChange={e => {
                      setSelectedSupplierId(e.target.value);
                      setSelectedPurchaseId('');
                      const s = suppliers.find(item => item.id === e.target.value);
                      if (s && s.amountOwed > 0) {
                        setAmount(s.amountOwed);
                      }
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="">Select supplier to pay...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.amountOwed > 0 ? `(Payable: ₦${s.amountOwed.toLocaleString()})` : '(Settled)'}
                      </option>
                    ))}
                  </select>
                </div>

                {supplierUnpaidPurchases.length > 0 && (
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">
                      Link to Specific Purchase Order (optional):
                    </label>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {supplierUnpaidPurchases.map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleQuickFillSupplier(p.id, p.outstanding_amount)}
                          className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            selectedPurchaseId === p.id
                              ? 'bg-rose-50 border-rose-500'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-slate-900">PO #{p.purchase_number}</span>
                            <span className="text-[11px] text-slate-400 block">{p.purchase_date}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-rose-800">
                              ₦{p.outstanding_amount.toLocaleString()} due
                            </span>
                            <span className="text-[10px] text-slate-400 block">Total: ₦{p.total.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Amount (₦) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-extrabold text-slate-900 focus:bg-white focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash on Hand</option>
                </select>
              </div>
            </div>

            {paymentMethod === 'bank' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Account
                </label>
                <select
                  value={selectedAccountId}
                  onChange={e => setSelectedAccountId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {accounts
                    .filter(a => a.isBusiness && a.type !== 'card')
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.bankName}) — ₦{a.balance.toLocaleString()}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Payment Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. TRF-90218, GTB-771"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional note..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={!amount || Number(amount) <= 0}
                className="flex-1 py-2.5 bg-[#047857] hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs transition-colors"
              >
                Confirm Payment
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
        )}
      </div>
    </div>
  );
};
