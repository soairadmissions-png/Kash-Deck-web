import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  Split,
  Building,
  User,
  ShoppingBag,
  Clock,
  HelpCircle,
  EyeOff
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { Transaction, TransactionMatchCandidate } from '../../types';

export const ReconciliationInbox: React.FC = () => {
  const {
    transactions,
    classifyTx,
    confirmTransactionMatch,
    ignoreOrMarkPersonal,
    classifyTransactionCustom,
    businessSales,
    customers,
    suppliers
  } = useFinancial();

  const [selectedTxForSplit, setSelectedTxForSplit] = useState<Transaction | null>(null);
  const [splitSalesState, setSplitSalesState] = useState<{ [saleId: string]: number }>({});
  const [showManualClassifyId, setShowManualClassifyId] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState('Other Income');
  const [selectedCustomerIdForCustom, setSelectedCustomerIdForCustom] = useState('');

  // Unresolved transactions requiring classification or confirmation
  const reviewTransactions = transactions.filter(
    t => t.isBusiness && (!t.reconciliationStatus || t.reconciliationStatus === 'unreconciled')
  );

  const reconciledTransactions = transactions.filter(
    t => t.isBusiness && t.reconciliationStatus === 'reconciled'
  );

  const handleOpenSplit = (tx: Transaction, customerId?: string) => {
    setSelectedTxForSplit(tx);
    const custSales = businessSales.filter(
      s => s.customer_id === customerId && s.outstanding_amount > 0
    );
    const initialSplit: { [saleId: string]: number } = {};
    let remaining = Math.abs(tx.amount);
    custSales.forEach(s => {
      const take = Math.min(s.outstanding_amount, remaining);
      initialSplit[s.id] = take;
      remaining -= take;
    });
    setSplitSalesState(initialSplit);
  };

  const handleConfirmSplit = (tx: Transaction, customerId: string) => {
    const splitList = Object.entries(splitSalesState)
      .filter(([_, amt]) => amt > 0)
      .map(([saleId, amt]) => ({ saleId, amount: amt }));

    classifyTransactionCustom(tx.id, 'customer_payment', {
      customerId,
      applyStrategy: 'split',
      splitSales: splitList
    });
    setSelectedTxForSplit(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Transactions to Review
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
              {reviewTransactions.length} Pending
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            CashDeck automatically matches bank data with business sales, purchases and transfers.
          </p>
        </div>
      </div>

      {/* Review Queue */}
      {reviewTransactions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/70 shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Everything is up to date</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All bank transactions have been reconciled with your sales, purchases, and expenses. New entries from bank feeds will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewTransactions.map(tx => {
            const match: TransactionMatchCandidate = classifyTx(tx);
            const isInflow = tx.amount > 0;
            const amountAbs = Math.abs(tx.amount);

            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 transition-all hover:border-slate-300"
              >
                {/* Top Row: Original Bank Transaction As Received */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isInflow ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isInflow ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {tx.merchantOrParty || tx.description}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                          {tx.accountName} • {tx.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Raw narrative: {tx.rawDescription || tx.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <span
                      className={`text-lg font-extrabold tracking-tight ${
                        isInflow ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {isInflow ? '+' : '−'}₦{amountAbs.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Ref: {tx.referenceId || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Middle Match Assessment / Exact Section 34 Pattern */}
                <div className="pt-4">
                  {/* High/Medium Confidence Customer Payment Match */}
                  {match.classification === 'customer_payment' && match.candidateSaleNumber && (
                    <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>CashDeck found a possible match:</span>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-emerald-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{match.customerName}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            Sale #{match.candidateSaleNumber} • ₦{(match.outstandingAmount || 0).toLocaleString()} outstanding
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md self-start sm:self-auto">
                          Exact Match
                        </span>
                      </div>

                      <p className="text-[11px] text-emerald-800 font-medium">
                        {match.reason}
                      </p>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <button
                          onClick={() => confirmTransactionMatch(tx.id, match)}
                          className="px-4 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          Confirm Match
                        </button>
                        <button
                          onClick={() => handleOpenSplit(tx, match.customerId)}
                          className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                        >
                          Choose Another / Split
                        </button>
                        <button
                          onClick={() => setShowManualClassifyId(tx.id)}
                          className="px-3.5 py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold"
                        >
                          Not a Customer Payment
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Multiple Sales / Customer Match */}
                  {match.classification === 'customer_payment' && !match.candidateSaleNumber && match.customerId && (
                    <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>{match.customerName} paid ₦{amountAbs.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-amber-900">{match.reason}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => confirmTransactionMatch(tx.id, match)}
                          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          Apply Oldest First
                        </button>
                        <button
                          onClick={() => handleOpenSplit(tx, match.customerId)}
                          className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-900 transition-colors"
                        >
                          Select Specific Sale / Split
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Supplier Payment Match */}
                  {match.classification === 'supplier_payment' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <Building className="w-4 h-4 text-slate-600" />
                        <span>Supplier settlement match: {match.supplierName}</span>
                      </div>
                      <p className="text-xs text-slate-600">{match.reason}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => confirmTransactionMatch(tx.id, match)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          Confirm Supplier Settlement
                        </button>
                        <button
                          onClick={() => ignoreOrMarkPersonal(tx.id)}
                          className="px-3 py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold"
                        >
                          Mark as Personal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Internal Transfer Detection */}
                  {match.classification === 'internal_transfer' && (
                    <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>Internal Transfer Detected</span>
                      </div>
                      <p className="text-xs text-blue-800">
                        This movement is between two connected accounts owned by the same business. Confirming this will NOT increase revenue or expense.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => confirmTransactionMatch(tx.id, match)}
                          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          Confirm Internal Transfer
                        </button>
                        <button
                          onClick={() => setShowManualClassifyId(tx.id)}
                          className="px-3 py-2 text-blue-600 hover:text-blue-800 text-xs font-semibold"
                        >
                          Reclassify
                        </button>
                      </div>
                    </div>
                  )}

                  {/* POS Settlement Match */}
                  {match.posMatchingSales && (
                    <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        <span>POS Terminal Daily Settlement Batch</span>
                      </div>
                      <p className="text-xs text-emerald-800">{match.reason}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => confirmTransactionMatch(tx.id, match)}
                          className="px-4 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          Reconcile POS Batch
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Low Confidence / Unknown Transaction Section 10 */}
                  {match.confidenceLevel === 'low' && showManualClassifyId !== tx.id && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <HelpCircle className="w-4 h-4 text-amber-500" />
                        <span>We need to know what this was for</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        CashDeck never silently guesses unknown transactions. Choose the category below:
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setShowManualClassifyId(tx.id)}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700"
                        >
                          Customer Payment
                        </button>
                        <button
                          onClick={() =>
                            confirmTransactionMatch(tx.id, {
                              classification: 'other_income',
                              confidence: 1.0,
                              confidenceLevel: 'high',
                              reason: 'Direct business revenue'
                            })
                          }
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700"
                        >
                          Business Income
                        </button>
                        <button
                          onClick={() =>
                            confirmTransactionMatch(tx.id, {
                              classification: 'owner_contribution',
                              confidence: 1.0,
                              confidenceLevel: 'high',
                              reason: 'Owner capital injection'
                            })
                          }
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700"
                        >
                          Owner Contribution
                        </button>
                        <button
                          onClick={() =>
                            confirmTransactionMatch(tx.id, {
                              classification: 'internal_transfer',
                              confidence: 1.0,
                              confidenceLevel: 'high',
                              reason: 'Internal transfer'
                            })
                          }
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700"
                        >
                          Internal Transfer
                        </button>
                        <button
                          onClick={() => ignoreOrMarkPersonal(tx.id)}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-500"
                        >
                          Personal / Ignore
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Manual Classification Form for Customer Payment selection */}
                  {showManualClassifyId === tx.id && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900">Select Customer for this payment:</h4>
                      <div className="flex gap-2">
                        <select
                          value={selectedCustomerIdForCustom}
                          onChange={e => setSelectedCustomerIdForCustom(e.target.value)}
                          className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                        >
                          <option value="">Select customer...</option>
                          {customers.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} (Owes: ₦{c.amountOwed.toLocaleString()})
                            </option>
                          ))}
                        </select>
                        <button
                          disabled={!selectedCustomerIdForCustom}
                          onClick={() => {
                            classifyTransactionCustom(tx.id, 'customer_payment', {
                              customerId: selectedCustomerIdForCustom
                            });
                            setShowManualClassifyId(null);
                          }}
                          className="px-4 py-2 bg-[#047857] disabled:opacity-50 text-white rounded-xl text-xs font-bold"
                        >
                          Apply Payment
                        </button>
                        <button
                          onClick={() => setShowManualClassifyId(null)}
                          className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Split across multiple sales modal */}
      {selectedTxForSplit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">Split Payment Across Sales</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total received: ₦{Math.abs(selectedTxForSplit.amount).toLocaleString()}
              </p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {businessSales
                .filter(s => s.outstanding_amount > 0)
                .map(sale => (
                  <div key={sale.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Sale #{sale.sale_number} ({sale.customer_name})</span>
                      <span className="text-amber-800">Owes: ₦{sale.outstanding_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400 text-[11px]">Apply: ₦</span>
                      <input
                        type="number"
                        value={splitSalesState[sale.id] || 0}
                        onChange={e =>
                          setSplitSalesState(prev => ({
                            ...prev,
                            [sale.id]: Number(e.target.value)
                          }))
                        }
                        className="flex-1 p-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() =>
                  handleConfirmSplit(
                    selectedTxForSplit,
                    selectedTxForSplit.merchantOrParty || ''
                  )
                }
                className="flex-1 py-2.5 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Confirm Allocation
              </button>
              <button
                onClick={() => setSelectedTxForSplit(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reconciled History Section */}
      {reconciledTransactions.length > 0 && (
        <div className="pt-6 border-t border-slate-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recently Reconciled Transactions ({reconciledTransactions.length})</span>
            </h3>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden divide-y divide-slate-100 text-xs">
            {reconciledTransactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
                <div>
                  <span className="font-bold text-slate-900">{tx.description}</span>
                  <span className="text-[11px] text-slate-500 block">
                    {tx.accountName} • {tx.reconciledWith?.label || 'Reconciled'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">
                    {tx.amount > 0 ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Matched & Linked</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
