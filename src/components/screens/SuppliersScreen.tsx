import React, { useState } from 'react';
import { Truck, Plus, Phone, Mail, ChevronRight, Package, DollarSign } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const SuppliersScreen: React.FC = () => {
  const { suppliers, inventory, accounts, addSupplierOrder, openDetail } = useFinancial();

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(inventory[0]?.id || '');
  const [orderQty, setOrderQty] = useState('10');
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts.find(a => a.isBusiness)?.id || accounts[0]?.id || '');

  const totalPayables = suppliers.reduce((s, sup) => s + sup.amountOwed, 0);
  const totalSupplyPurchases = suppliers.reduce((s, sup) => s + sup.totalPurchases, 0);

  const product = inventory.find(i => i.id === selectedProductId);
  const supplier = suppliers.find(s => s.id === selectedSupplierId);
  const calculatedCost = (product?.costPrice || 0) * (parseInt(orderQty) || 1);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !supplier) return;

    const qty = parseInt(orderQty) || 1;
    const paid = amountPaidInput === '' ? calculatedCost : parseFloat(amountPaidInput);

    addSupplierOrder(
      supplier.id,
      [{ productId: product.id, quantity: qty, unitCost: product.costPrice }],
      calculatedCost,
      paid,
      selectedAccountId
    );

    setShowOrderModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Suppliers & Payables
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Vendor sourcing records, inventory purchasing ledger and debt payables.
          </p>
        </div>

        <button
          onClick={() => setShowOrderModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Inventory Order</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total Payables (You Owe)</span>
          <p className="text-2xl font-bold text-rose-700 mt-1">
            ₦{totalPayables.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Pending supplier settlements
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total Inventory Procured</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₦{totalSupplyPurchases.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Across {suppliers.length} primary distributors
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Settled Ratio</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {Math.round(((totalSupplyPurchases - totalPayables) / totalSupplyPurchases) * 100)}%
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Fully paid supply volume
          </span>
        </div>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suppliers.map(sup => (
          <div
            key={sup.id}
            onClick={() => openDetail('supplier', sup)}
            className="bg-white rounded-2xl p-5 border border-slate-200/70 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group space-y-4"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {sup.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">{sup.contactPerson}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sup.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{sup.email}</span>
                </div>
              </div>

              {/* Products Supplied Pills */}
              <div className="mt-3 flex flex-wrap gap-1">
                {sup.productsSupplied.map((p, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-semibold text-slate-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Bought</span>
                <p className="font-bold text-slate-900">₦{sup.totalPurchases.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Owed</span>
                <p className={`font-bold ${sup.amountOwed > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                  ₦{sup.amountOwed.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Supplier Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Procure Inventory from Supplier</h3>
            <p className="text-[11px] text-slate-500">
              Increases stock quantities and records payable / outgoing business expense.
            </p>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Supplier</label>
                <select
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.contactPerson})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Item to Restock</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Cost: ₦{i.costPrice.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Quantity to Order</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={orderQty}
                  onChange={e => setOrderQty(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-slate-500 font-medium">Calculated Cost</span>
                <span className="text-base font-extrabold text-slate-900">
                  ₦{calculatedCost.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Amount Paid Now (₦)
                </label>
                <input
                  type="number"
                  placeholder={`Leave empty for full payment ₦${calculatedCost.toLocaleString()}`}
                  value={amountPaidInput}
                  onChange={e => setAmountPaidInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pay From Business Account</label>
                <select
                  value={selectedAccountId}
                  onChange={e => setSelectedAccountId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (₦{acc.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#047857] hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  Confirm Supply Order
                </button>
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
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
