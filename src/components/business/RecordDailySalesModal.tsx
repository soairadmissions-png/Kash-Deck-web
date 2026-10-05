import React, { useState } from 'react';
import { X, Calendar, DollarSign, CheckCircle2, AlertCircle, ArrowRight, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { apiV1 } from '../../services/apiV1';
import { parseForgivingCurrency } from '../onboarding/personal/PersonalStep2';

interface RecordDailySalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: () => void;
  initialDate?: string;
}

export const RecordDailySalesModal: React.FC<RecordDailySalesModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
  initialDate
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(initialDate || today);
  const [totalSalesStr, setTotalSalesStr] = useState('');
  const [cashStr, setCashStr] = useState('');
  const [transferStr, setTransferStr] = useState('');
  const [posStr, setPosStr] = useState('');
  const [otherStr, setOtherStr] = useState('');
  const [transactionCountStr, setTransactionCountStr] = useState('');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedTotal = parseForgivingCurrency(totalSalesStr);
  const parsedCash = parseForgivingCurrency(cashStr);
  const parsedTransfer = parseForgivingCurrency(transferStr);
  const parsedPos = parseForgivingCurrency(posStr);
  const parsedOther = parseForgivingCurrency(otherStr);
  const breakdownSum = parsedCash + parsedTransfer + parsedPos + parsedOther;

  // Remainder helper to auto-fill
  const remainder = Math.max(0, parsedTotal - breakdownSum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (parsedTotal <= 0) {
      setError('Please enter a total sales amount greater than ₦0.');
      return;
    }

    if (breakdownSum > 0 && breakdownSum !== parsedTotal) {
      setError(
        `Payment breakdown sum (₦${breakdownSum.toLocaleString()}) does not match Total Sales (₦${parsedTotal.toLocaleString()}).`
      );
      return;
    }

    setIsLoading(true);
    try {
      await apiV1.recordDailySales(workspaceId, {
        date,
        totalSalesMinor: parsedTotal * 100,
        cashMinor: parsedCash * 100,
        transferMinor: parsedTransfer * 100,
        posMinor: parsedPos * 100,
        otherMinor: parsedOther * 100,
        transactionCount: transactionCountStr ? parseInt(transactionCountStr, 10) : undefined,
        notes: notes.trim() || undefined
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record daily sales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200/80 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Record Daily Sales</h3>
            <p className="text-xs text-slate-500">Fast one-touch summary for today's receipts.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sales Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={date}
                max={today}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
              />
            </div>
          </div>

          {/* Total Sales Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Total Day's Sales <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base">₦</span>
              <input
                type="text"
                inputMode="numeric"
                value={totalSalesStr}
                onChange={e => setTotalSalesStr(e.target.value)}
                placeholder="e.g. 486,500 or 486k"
                required
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 text-base font-bold bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
              />
            </div>
            {parsedTotal > 0 && (
              <span className="text-xs text-emerald-700 font-bold mt-1 block">
                Total: ₦{parsedTotal.toLocaleString()}
              </span>
            )}
          </div>

          {/* Payment Method Breakdown (Optional) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Payment Method Breakdown
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Optional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Cash */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cash Drawer</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₦</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cashStr}
                    onChange={e => setCashStr(e.target.value)}
                    placeholder="0"
                    className="w-full pl-6 pr-2 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Transfer */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Bank Transfer</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₦</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={transferStr}
                    onChange={e => setTransferStr(e.target.value)}
                    placeholder="0"
                    className="w-full pl-6 pr-2 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* POS */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                  <span>POS Terminal</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₦</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={posStr}
                    onChange={e => setPosStr(e.target.value)}
                    placeholder="0"
                    className="w-full pl-6 pr-2 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Remainder helper */}
            {parsedTotal > 0 && remainder > 0 && breakdownSum > 0 && (
              <div className="flex items-center justify-between text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg">
                <span>Remaining unallocated: ₦{remainder.toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (parsedCash === 0) setCashStr((parsedCash + remainder).toString());
                    else if (parsedTransfer === 0) setTransferStr((parsedTransfer + remainder).toString());
                    else setPosStr((parsedPos + remainder).toString());
                  }}
                  className="font-bold underline"
                >
                  Allocate remainder
                </button>
              </div>
            )}
          </div>

          {/* Transaction count & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Number of Sales / Receipts <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                min="0"
                value={transactionCountStr}
                onChange={e => setTransactionCountStr(e.target.value)}
                placeholder="e.g. 35"
                className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Day Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Rainy day, bulk order discount"
                className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || parsedTotal <= 0}
              className="px-6 py-2.5 bg-[#047857] hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save Daily Sales'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
