import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Target,
  ShoppingBag,
  Package,
  Users,
  Truck,
  Landmark,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Minus,
  DollarSign,
  Copy,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { BankLogo } from './BankLogo';

export const DetailModal: React.FC = () => {
  const {
    activeDetailItem,
    closeDetail,
    depositToGoal,
    updateInventoryStock,
    recordCustomerPayment,
    updateTransactionMetadata,
    accounts
  } = useFinancial();

  // Local state for actions inside modal
  const [depositAmount, setDepositAmount] = useState('50000');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [showDepositForm, setShowDepositForm] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState('50000');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const [stockDelta, setStockDelta] = useState('5');
  const [showStockForm, setShowStockForm] = useState(false);

  // Local states for transaction editing
  const [editedCategory, setEditedCategory] = useState('');
  const [editedClassification, setEditedClassification] = useState<'Personal' | 'Business'>('Personal');
  const [editedNotes, setEditedNotes] = useState('');
  const [hasSavedTx, setHasSavedTx] = useState(false);

  if (!activeDetailItem) return null;

  const { type, data } = activeDetailItem;

  const handleSaveTransactionEdits = () => {
    const cat = editedCategory || data.category;
    const cls = editedClassification || (data.isBusiness ? 'Business' : 'Personal');
    const nts = editedNotes !== undefined ? editedNotes : data.notes;

    updateTransactionMetadata(data.id, {
      category: cat,
      classification: cls,
      notes: nts
    });

    data.category = cat;
    data.classification = cls;
    data.isBusiness = cls === 'Business';
    data.notes = nts;

    setHasSavedTx(true);
    setTimeout(() => setHasSavedTx(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
              {type === 'transaction' && <CreditCard className="w-4 h-4" />}
              {type === 'goal' && <Target className="w-4 h-4" />}
              {type === 'sale' && <ShoppingBag className="w-4 h-4" />}
              {type === 'inventory' && <Package className="w-4 h-4" />}
              {type === 'customer' && <Users className="w-4 h-4" />}
              {type === 'supplier' && <Truck className="w-4 h-4" />}
              {type === 'account' && <Landmark className="w-4 h-4" />}
              {type === 'calendar' && <Calendar className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {type} Details
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {data.description || data.name || data.title || data.invoiceNo}
              </h3>
            </div>
          </div>
          <button
            onClick={closeDetail}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* TRANSACTION DETAIL */}
          {type === 'transaction' && (
            <div className="space-y-4">
              {/* Bank Provider Banner */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-150 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BankLogo bankName={data.accountName || 'Bank'} size="md" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {data.accountName}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {data.accountMasked || '•••• 4821'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    <span>Direct Bank Feed</span>
                  </span>
                </div>
              </div>

              {/* Amount & Status Card */}
              <div className="text-center py-5 bg-slate-50/60 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      data.amount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {data.amount > 0 ? (
                      <ArrowDownLeft className="w-3 h-3 text-emerald-800" />
                    ) : (
                      <ArrowUpRight className="w-3 h-3 text-slate-700" />
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {data.amount > 0 ? 'Credit (Inflow)' : 'Debit (Outflow)'}
                  </span>
                </div>

                <span
                  className={`text-3xl sm:text-4xl font-black tracking-tight ${
                    data.amount > 0 ? 'text-emerald-800' : 'text-slate-900'
                  }`}
                >
                  {data.amount > 0 ? '+' : ''}₦{Math.abs(data.amount).toLocaleString()}
                </span>

                <div className="mt-2 flex justify-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      data.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : data.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {data.status === 'Completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    <span>{data.status}</span>
                  </span>
                </div>
              </div>

              {/* 1. BANK DATA (IMMUTABLE DIRECT FEED FROM INSTITUTION) - Section 16 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Bank Data (Provided by Institution)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Immutable</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Financial Institution</span>
                    <span className="font-bold text-slate-800">{data.accountName}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{data.accountMasked || '•••• 4821'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Payment Channel</span>
                    <span className="font-bold text-slate-800">{data.channel || 'Bank Transfer'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Transaction Date & Time</span>
                    <span className="font-bold text-slate-800 text-[11px]">
                      {data.date} {data.time ? `• ${data.time}` : ''}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Party / Counterparty</span>
                    <span className="font-bold text-slate-800 text-[11px] truncate block">
                      {data.sender ? `From: ${data.sender}` : data.recipient ? `To: ${data.recipient}` : data.merchant || 'Bank Settlement'}
                    </span>
                  </div>
                </div>

                {/* Reference ID with click to copy */}
                {data.referenceId && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-medium">
                        Official Bank Reference
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {data.referenceId}
                      </span>
                    </div>
                    <button
                      onClick={() => navigator.clipboard?.writeText(data.referenceId)}
                      className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                      title="Copy reference"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Raw Bank Memo */}
                {data.rawDescription && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-xs">
                    <span className="text-slate-400 block text-[10px] font-medium mb-0.5">
                      Original Bank Description / Narrative
                    </span>
                    <p className="font-mono text-slate-700 text-[11px] break-all">
                      {data.rawDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* 2. CASHDECK DATA (USER CLASSIFICATION & LABELS) - Section 16 */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>CashDeck Data (Organization & Notes)</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">User Editable</span>
                </div>

                <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-150 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Category
                      </label>
                      <select
                        defaultValue={data.category || 'General'}
                        onChange={e => setEditedCategory(e.target.value)}
                        className="w-full p-2 bg-white rounded-xl border border-emerald-200 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
                      >
                        <option value="Transfer">Transfer</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Food & Dining">Food & Dining</option>
                        <option value="Transport">Transport</option>
                        <option value="Income">Income / Retainer</option>
                        <option value="Business">Business Inventory</option>
                        <option value="Personal">Personal Allowance</option>
                        <option value="Receivable">Receivables</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Classification
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => setEditedClassification('Personal')}
                          className={`py-1.5 px-2 rounded-lg font-bold text-xs transition-all ${
                            (editedClassification || (data.isBusiness ? 'Business' : 'Personal')) === 'Personal'
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-600'
                          }`}
                        >
                          Personal
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditedClassification('Business')}
                          className={`py-1.5 px-2 rounded-lg font-bold text-xs transition-all ${
                            (editedClassification || (data.isBusiness ? 'Business' : 'Personal')) === 'Business'
                              ? 'bg-emerald-800 text-white shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-600'
                          }`}
                        >
                          Business
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      User Notes & Tags
                    </label>
                    <input
                      type="text"
                      defaultValue={data.notes || ''}
                      onChange={e => setEditedNotes(e.target.value)}
                      placeholder="Add reference notes or client details..."
                      className="w-full p-2 bg-white rounded-xl border border-emerald-200 text-xs text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-slate-500">
                      Changes only affect CashDeck reports, never modifying your bank statement.
                    </p>
                    <button
                      onClick={handleSaveTransactionEdits}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs shrink-0"
                    >
                      {hasSavedTx ? 'Saved ✓' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GOAL DETAIL */}
          {type === 'goal' && (
            <div className="space-y-4">
              <div className="text-center py-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <span className="text-xs text-emerald-800 font-medium block">
                  Current Savings
                </span>
                <span className="text-3xl font-extrabold text-emerald-950">
                  ₦{data.currentAmount.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 block mt-1">
                  Target: ₦{data.targetAmount.toLocaleString()} (Due {data.targetDate})
                </span>
                <div className="w-4/5 mx-auto bg-emerald-200/60 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round((data.currentAmount / data.targetAmount) * 100))}%`
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-emerald-700 mt-2 block">
                  {Math.round((data.currentAmount / data.targetAmount) * 100)}% Completed
                </span>
              </div>

              {/* Deposit to Goal Form */}
              {showDepositForm ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">
                    Deposit to {data.name}
                  </h4>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">
                      From Account
                    </label>
                    <select
                      value={selectedAccountId}
                      onChange={e => setSelectedAccountId(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} (₦{acc.balance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">
                      Amount (₦)
                    </label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const amt = Number(depositAmount);
                        if (amt > 0) {
                          depositToGoal(data.id, amt, selectedAccountId);
                          data.currentAmount += amt;
                          setShowDepositForm(false);
                        }
                      }}
                      className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
                    >
                      Confirm Deposit
                    </button>
                    <button
                      onClick={() => setShowDepositForm(false)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDepositForm(true)}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Money to this Goal</span>
                </button>
              )}
            </div>
          )}

          {/* SALE DETAIL */}
          {type === 'sale' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Customer</span>
                  <h4 className="text-sm font-bold text-slate-900">{data.customerName}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-medium">Total Amount</span>
                  <h4 className="text-sm font-bold text-emerald-800">
                    ₦{data.totalAmount.toLocaleString()}
                  </h4>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                  <span>Product / Item</span>
                  <span>Qty × Price</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {data.items?.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 flex justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">{item.productName}</p>
                        <p className="text-[11px] text-slate-400">₦{item.unitPrice.toLocaleString()} each</p>
                      </div>
                      <span className="font-bold text-slate-900">
                        ₦{item.total.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Payment Method</span>
                  <span className="font-bold text-slate-800">{data.paymentMethod}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Status</span>
                  <span className="font-bold text-emerald-700">{data.paymentStatus}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Amount Paid</span>
                  <span className="font-bold text-slate-800">₦{data.amountPaid.toLocaleString()}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Balance Due</span>
                  <span className="font-bold text-amber-700">
                    ₦{Math.max(0, data.totalAmount - data.amountPaid).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* INVENTORY DETAIL */}
          {type === 'inventory' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">SKU</span>
                  <span className="font-mono font-bold text-slate-800">{data.sku}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Category</span>
                  <span className="font-bold text-slate-800">{data.category}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Cost Price</span>
                  <span className="font-bold text-slate-800">₦{data.costPrice.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Selling Price</span>
                  <span className="font-bold text-emerald-800">₦{data.sellingPrice.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">In Stock</span>
                  <span className="font-bold text-slate-900 text-sm">{data.quantity} units</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Stock Value</span>
                  <span className="font-bold text-slate-900 text-sm">₦{data.stockValue.toLocaleString()}</span>
                </div>
              </div>

              {/* Adjust Stock Controls */}
              {showStockForm ? (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Adjust Stock Quantity
                  </span>
                  <input
                    type="number"
                    value={stockDelta}
                    onChange={e => setStockDelta(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                    placeholder="Quantity"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const delta = Number(stockDelta);
                        updateInventoryStock(data.id, delta, 'adjustment');
                        data.quantity += delta;
                        data.stockValue = data.quantity * data.costPrice;
                        setShowStockForm(false);
                      }}
                      className="flex-1 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold"
                    >
                      + Add {stockDelta} Units
                    </button>
                    <button
                      onClick={() => {
                        const delta = Number(stockDelta);
                        updateInventoryStock(data.id, -delta, 'adjustment');
                        data.quantity = Math.max(0, data.quantity - delta);
                        data.stockValue = data.quantity * data.costPrice;
                        setShowStockForm(false);
                      }}
                      className="flex-1 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
                    >
                      - Deduct {stockDelta} Units
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowStockForm(true)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Adjust Physical Stock Quantity
                </button>
              )}
            </div>
          )}

          {/* CUSTOMER DETAIL */}
          {type === 'customer' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <p className="text-xs text-slate-400">Contact Details</p>
                <p className="text-sm font-bold text-slate-800">{data.phone}</p>
                <p className="text-xs text-slate-600">{data.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Total Purchases</span>
                  <span className="font-bold text-slate-900 text-sm">{data.purchasesCount} orders</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Total Spent</span>
                  <span className="font-bold text-slate-900 text-sm">₦{data.totalSpent.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-rose-50/60 rounded-xl col-span-2">
                  <span className="text-rose-700 block text-[11px] font-semibold">Amount Owed (Receivable)</span>
                  <span className="font-bold text-rose-800 text-base">₦{data.amountOwed.toLocaleString()}</span>
                </div>
              </div>

              {data.amountOwed > 0 && (
                <div>
                  {showPaymentForm ? (
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-800 block">
                        Record Customer Payment Received
                      </span>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={e => setPaymentAmount(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const amt = Number(paymentAmount);
                            recordCustomerPayment(data.id, amt, selectedAccountId);
                            data.amountOwed = Math.max(0, data.amountOwed - amt);
                            setShowPaymentForm(false);
                          }}
                          className="flex-1 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                        >
                          Record ₦{Number(paymentAmount).toLocaleString()} Payment
                        </button>
                        <button
                          onClick={() => setShowPaymentForm(false)}
                          className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPaymentForm(true)}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
                    >
                      Record Payment Received from Customer
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SUPPLIER DETAIL */}
          {type === 'supplier' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1 text-xs">
                <span className="text-slate-400 block font-medium">Contact Person</span>
                <p className="font-bold text-slate-800 text-sm">{data.contactPerson}</p>
                <p className="text-slate-600">{data.phone} • {data.email}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl text-xs">
                <span className="text-slate-400 block font-medium mb-1.5">Products Supplied</span>
                <div className="flex flex-wrap gap-1.5">
                  {data.productsSupplied?.map((p: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold text-[11px]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Total Purchases</span>
                  <span className="font-bold text-slate-900 text-sm">₦{data.totalPurchases.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-rose-50/60 rounded-xl">
                  <span className="text-rose-700 block text-[11px] font-semibold">Amount Owed (Payable)</span>
                  <span className="font-bold text-rose-800 text-sm">₦{data.amountOwed.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT DETAIL */}
          {type === 'account' && (
            <div className="space-y-4">
              <div className="text-center py-4 bg-slate-50 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium block">
                  Current Balance
                </span>
                <span className="text-3xl font-extrabold text-slate-900">
                  ₦{data.balance.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 block mt-1">
                  {data.bankName} • {data.accountNumber || 'Primary Account'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Account Type</span>
                  <span className="font-bold text-slate-800 capitalize">{data.type}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Workspace</span>
                  <span className="font-bold text-slate-800">{data.isBusiness ? 'Business' : 'Personal'}</span>
                </div>
              </div>
            </div>
          )}

          {/* CALENDAR DETAIL */}
          {type === 'calendar' && (
            <div className="space-y-4">
              <div className="text-center py-4 bg-slate-50 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium block">
                  Event Amount
                </span>
                <span className="text-3xl font-extrabold text-slate-900">
                  ₦{data.amount.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 block mt-1">
                  Date: {data.date} {data.dueText ? `(${data.dueText})` : ''}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Category</span>
                  <span className="font-bold text-slate-800">{data.category}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Type</span>
                  <span className="font-bold text-slate-800 capitalize">{data.type}</span>
                </div>
              </div>
            </div>
          )}

          {/* RECURRING EXPENSE DETAIL */}
          {type === 'recurring' && (
            <div className="space-y-4">
              <div className="text-center py-4 bg-slate-50 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium block">
                  Recurring Amount
                </span>
                <span className="text-3xl font-extrabold text-slate-900">
                  ₦{data.amount.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 block mt-1">
                  Frequency: {data.frequency} • Next: {data.nextPaymentDate}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Category</span>
                  <span className="font-bold text-slate-800">{data.category}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Paid From</span>
                  <span className="font-bold text-slate-800">{data.accountName}</span>
                </div>
              </div>
            </div>
          )}

          {/* INSIGHT DETAIL */}
          {type === 'insight' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">1. What Happened</span>
                <p className="font-bold text-slate-900 mt-0.5">{data.whatHappened}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">2. Evidence</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{data.evidence}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">3. Why It Occurred</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{data.explanation}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">4. Recommendation</span>
                <p className="text-emerald-950 font-medium mt-0.5 leading-relaxed">{data.recommendation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50/40">
          <button
            onClick={closeDetail}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
