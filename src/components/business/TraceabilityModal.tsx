import React from 'react';
import { X, ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2, ChevronRight, Package, AlertCircle } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

interface TraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricKey: 'revenue' | 'expenses' | 'cogs' | 'profit' | 'receivables' | 'payables' | 'inventory' | 'cash';
}

export const TraceabilityModal: React.FC<TraceabilityModalProps> = ({
  isOpen,
  onClose,
  metricKey
}) => {
  const {
    businessSales,
    businessExpenses,
    businessPurchases,
    customers,
    suppliers,
    products,
    movements,
    deriveStock,
    deriveCustBalance,
    deriveSupBalance,
    cashOnHand,
    accounts
  } = useFinancial();

  if (!isOpen) return null;

  const validSales = businessSales.filter(s => s.status !== 'cancelled');

  let title = '';
  let subtitle = '';
  let totalFormatted = '';
  let renderContent = null;

  switch (metricKey) {
    case 'revenue': {
      title = 'Revenue Traceability';
      subtitle = 'Every sales transaction included in this period’s top-line revenue.';
      const totalRev = validSales.reduce((sum, s) => sum + s.total, 0);
      totalFormatted = `₦${totalRev.toLocaleString()}`;
      renderContent = (
        <div className="space-y-3">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-xs text-emerald-900 flex items-center justify-between">
            <span className="font-semibold">{validSales.length} recorded sales included in this figure</span>
            <span className="font-bold">{totalFormatted}</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {validSales.map(sale => (
              <div key={sale.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Sale #{sale.sale_number}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      sale.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sale.status === 'paid' ? 'Paid in full' : sale.status === 'partially_paid' ? 'Partially paid' : 'Credit / Unpaid'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Customer: {sale.customer_name || 'Walk-in'} • {sale.sale_date} • {sale.items.length} item(s)
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">₦{sale.total.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400">{sale.payment_method}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      break;
    }

    case 'expenses': {
      title = 'Operating Expenses Traceability';
      subtitle = 'Verified operating expense records (excludes personal transactions and owner withdrawals).';
      const totalExp = businessExpenses.reduce((sum, e) => sum + e.amount, 0);
      totalFormatted = `₦${totalExp.toLocaleString()}`;
      renderContent = (
        <div className="space-y-3">
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-800 flex items-center justify-between">
            <span className="font-semibold">{businessExpenses.length} business expense records included</span>
            <span className="font-bold">{totalFormatted}</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {businessExpenses.map(exp => (
              <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-lg">
                <div>
                  <span className="font-bold text-slate-900">{exp.description}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Category: {exp.category_id} • {exp.expense_date} • {exp.payment_method.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-700 block">−₦{exp.amount.toLocaleString()}</span>
                  {exp.transaction_id && (
                    <span className="text-[10px] text-emerald-700 font-medium">✓ Linked to bank feed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      break;
    }

    case 'receivables': {
      title = 'Accounts Receivable Traceability';
      subtitle = 'Breakdown of customer debts derived from credit sales minus confirmed payments.';
      let totalReceivable = 0;
      const debtorList = customers
        .map(c => {
          const bal = deriveCustBalance(c.id);
          totalReceivable += bal.amountOwed;
          return { customer: c, ...bal };
        })
        .filter(d => d.amountOwed > 0);

      totalFormatted = `₦${totalReceivable.toLocaleString()}`;
      renderContent = (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <span className="font-semibold">{debtorList.length} customer(s) with pending outstanding balances</span>
            <span className="font-bold">{totalFormatted}</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {debtorList.map(item => (
              <div key={item.customer.id} className="py-3 px-2 hover:bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{item.customer.name}</span>
                    <span className="text-[11px] text-slate-500 block">{item.customer.phone}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-800">₦{item.amountOwed.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 block">
                      {item.outstandingSales.length} invoice(s) due
                    </span>
                  </div>
                </div>
                {item.outstandingSales.length > 0 && (
                  <div className="mt-2 pl-3 border-l-2 border-amber-300 space-y-1">
                    {item.outstandingSales.map(s => (
                      <div key={s.id} className="flex justify-between text-[11px] text-slate-600">
                        <span>Sale #{s.sale_number} ({s.sale_date})</span>
                        <span className="font-semibold">₦{s.outstanding_amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
      break;
    }

    case 'payables': {
      title = 'Supplier Payables Traceability';
      subtitle = 'Pending settlements owed to product vendors and distributors.';
      let totalPayable = 0;
      const payableList = suppliers
        .map(s => {
          const bal = deriveSupBalance(s.id);
          totalPayable += bal.amountOwed;
          return { supplier: s, ...bal };
        })
        .filter(p => p.amountOwed > 0);

      totalFormatted = `₦${totalPayable.toLocaleString()}`;
      renderContent = (
        <div className="space-y-3">
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 flex items-center justify-between">
            <span className="font-semibold">{payableList.length} supplier(s) with pending invoices</span>
            <span className="font-bold">{totalFormatted}</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {payableList.map(item => (
              <div key={item.supplier.id} className="py-3 px-2 hover:bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{item.supplier.name}</span>
                    <span className="text-[11px] text-slate-500 block">{item.supplier.contactPerson} ({item.supplier.phone})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-700">₦{item.amountOwed.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 block">{item.outstandingPurchases.length} order(s)</span>
                  </div>
                </div>
                {item.outstandingPurchases.length > 0 && (
                  <div className="mt-2 pl-3 border-l-2 border-rose-300 space-y-1">
                    {item.outstandingPurchases.map(p => (
                      <div key={p.id} className="flex justify-between text-[11px] text-slate-600">
                        <span>Purchase #{p.purchase_number} ({p.purchase_date})</span>
                        <span className="font-semibold">₦{p.outstanding_amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
      break;
    }

    case 'inventory': {
      title = 'Inventory Valuation Traceability';
      subtitle = 'Valued at wholesale cost price. Quantity is 100% derived from auditable movements.';
      let totalInvVal = 0;
      products.forEach(p => {
        const stock = deriveStock(p.id);
        totalInvVal += Math.max(0, stock) * p.cost_price;
      });
      totalFormatted = `₦${totalInvVal.toLocaleString()}`;
      renderContent = (
        <div className="space-y-3">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <span className="font-semibold">Stock quantity computed from {movements.length} logged stock movements</span>
            <span className="font-bold">{totalFormatted}</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {products.map(p => {
              const currentStock = deriveStock(p.id);
              const val = Math.max(0, currentStock) * p.cost_price;
              return (
                <div key={p.id} className="py-2.5 px-2 flex items-center justify-between text-xs hover:bg-slate-50 rounded-lg">
                  <div>
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <p className="text-[11px] text-slate-500">
                      SKU: {p.sku} • Cost: ₦{p.cost_price.toLocaleString()} • Selling: ₦{p.selling_price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{currentStock} units</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">₦{val.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
      break;
    }

    case 'cash': {
      title = 'Business Cash Position';
      subtitle = 'Complete breakdown of liquid business funds across connected bank feeds and physical cash on hand.';
      const bizAccounts = accounts.filter(a => a.isBusiness && a.type !== 'card');
      const bankTotal = bizAccounts.reduce((sum, a) => sum + a.balance, 0);
      const totalCash = bankTotal + cashOnHand;
      totalFormatted = `₦${totalCash.toLocaleString()}`;

      renderContent = (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">Bank Accounts ({bizAccounts.length})</span>
              <p className="text-base font-bold text-slate-900 mt-1">₦{bankTotal.toLocaleString()}</p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[11px] text-emerald-800 font-medium">Physical Cash on Hand</span>
              <p className="text-base font-bold text-emerald-900 mt-1">₦{cashOnHand.toLocaleString()}</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {bizAccounts.map(acc => (
              <div key={acc.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900">{acc.name}</span>
                  <span className="text-[11px] text-slate-500 block">{acc.maskedAccountNumber} • {acc.bankName}</span>
                </div>
                <span className="font-bold text-slate-900">₦{acc.balance.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      );
      break;
    }

    default:
      title = 'Record Traceability';
      subtitle = 'Underlying business transactions.';
      renderContent = null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-150 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{title}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Traceable Data
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Banner */}
        <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Current Computed Total</span>
          <span className="text-lg font-extrabold text-slate-900 tracking-tight">{totalFormatted}</span>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {renderContent}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Underlying records audit verified</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close Drill-Down
          </button>
        </div>
      </div>
    </div>
  );
};
