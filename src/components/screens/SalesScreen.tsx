import React, { useState } from 'react';
import {
  Plus,
  ShoppingBag,
  Search,
  Download,
  CheckCircle2,
  Clock,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { SalePaymentMethod, SalePaymentStatus } from '../../types';

export const SalesScreen: React.FC = () => {
  const { sales, inventory, customers, addSale, openDetail } = useFinancial();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(inventory[0]?.id || '');
  const [quantity, setQuantity] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState<SalePaymentMethod>('Transfer');
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [notes, setNotes] = useState('');

  const totalSalesCount = sales.length;
  const totalRevenue = sales.reduce((s, x) => s + x.totalAmount, 0);
  const totalOutstanding = sales.reduce((s, x) => s + Math.max(0, x.totalAmount - x.amountPaid), 0);

  const selectedProduct = inventory.find(i => i.id === selectedProductId);
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const calculatedTotal = (selectedProduct?.sellingPrice || 0) * (parseInt(quantity) || 1);

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedCustomer) return;

    const qty = parseInt(quantity) || 1;
    const paid = amountPaidInput === '' ? calculatedTotal : parseFloat(amountPaidInput);

    let status: SalePaymentStatus = 'Completed';
    if (paid < calculatedTotal && paid > 0) {
      status = 'Pending'; // Partial
    } else if (paid === 0) {
      status = 'Pending'; // Credit
    }

    addSale({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      items: [
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: qty,
          unitPrice: selectedProduct.sellingPrice,
          total: calculatedTotal
        }
      ],
      totalAmount: calculatedTotal,
      amountPaid: paid,
      discount: 0,
      paymentMethod,
      paymentStatus: status,
      date: new Date().toISOString().split('T')[0],
      notes
    });

    setQuantity('1');
    setAmountPaidInput('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Sales Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track customer sales, credit purchases, instant transfers and inventory deductions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Sale</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total Sales Revenue</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₦{totalRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Across {totalSalesCount} completed orders
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Outstanding Customer Balances</span>
          <p className="text-2xl font-bold text-amber-700 mt-1">
            ₦{totalOutstanding.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Accounts receivable from credit sales
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Collection Rate</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {Math.round(((totalRevenue - totalOutstanding) / totalRevenue) * 100)}%
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Cash & Transfer settled
          </span>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 text-slate-400 font-semibold border-b border-slate-100">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Sold</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map(sale => {
                const balanceDue = Math.max(0, sale.totalAmount - sale.amountPaid);
                return (
                  <tr
                    key={sale.id}
                    onClick={() => openDetail('sale', sale)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-emerald-800">
                      {sale.invoiceNo}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {sale.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {sale.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {sale.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ₦{sale.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-emerald-700">
                      ₦{sale.amountPaid.toLocaleString()}
                      {balanceDue > 0 && (
                        <span className="block text-[10px] text-amber-700 font-bold">
                          Due: ₦{balanceDue.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          sale.paymentStatus === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sale.paymentStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record New Sale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Business Sale</h3>
              <p className="text-[11px] text-slate-500">
                Connected logic: reduces stock, adds revenue, updates customer ledger.
              </p>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} — ₦{i.sellingPrice.toLocaleString()} ({i.quantity} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity || 100}
                    required
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="POS">POS / Card</option>
                    <option value="Credit sale">Credit Sale (Pay Later)</option>
                    <option value="Partial payment">Partial Payment</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-slate-500 font-medium">Calculated Total</span>
                <span className="text-base font-extrabold text-slate-900">
                  ₦{calculatedTotal.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Amount Received Now (₦)
                </label>
                <input
                  type="number"
                  placeholder={`Leave empty for full ₦${calculatedTotal.toLocaleString()}`}
                  value={amountPaidInput}
                  onChange={e => setAmountPaidInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Delivery details or deposit remarks"
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
                  Record Sale
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
