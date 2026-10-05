import React, { useState } from 'react';
import { X, Package, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { InventoryMovementType } from '../../types';

interface InventoryMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryMovementModal: React.FC<InventoryMovementModalProps> = ({
  isOpen,
  onClose
}) => {
  const { products, recordInventoryMovement, deriveStock } = useFinancial();

  const [productId, setProductId] = useState<string>(products[0]?.id || '');
  const [movementType, setMovementType] = useState<InventoryMovementType>('adjustment');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const selectedProduct = products.find(p => p.id === productId) || products[0];
  const currentStock = selectedProduct ? deriveStock(selectedProduct.id) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity === 0) return;

    // Determine sign: damage is negative, return is positive, adjustment can be positive or negative
    let signedQty = quantity;
    if (movementType === 'damage') {
      signedQty = -Math.abs(quantity);
    } else if (movementType === 'return') {
      signedQty = Math.abs(quantity);
    }

    recordInventoryMovement({
      business_id: 'biz-01',
      product_id: selectedProduct.id,
      movement_type: movementType,
      quantity: signedQty,
      unit_cost: selectedProduct.cost_price,
      source_type: movementType === 'damage' ? 'damage' : movementType === 'return' ? 'return' : 'manual_adjustment',
      notes: notes || `Audited ${movementType} movement`
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-150 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Stock Movement</h3>
              <p className="text-[11px] text-slate-500">Every change is auditable and updates true inventory quantity.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Product</label>
            <select
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current: {deriveStock(p.id)} in stock)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Movement Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMovementType('adjustment')}
                className={`py-2 rounded-xl font-bold text-xs border ${
                  movementType === 'adjustment' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200'
                }`}
              >
                Count Adjustment
              </button>
              <button
                type="button"
                onClick={() => setMovementType('return')}
                className={`py-2 rounded-xl font-bold text-xs border ${
                  movementType === 'return' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                Customer Return (+Stock)
              </button>
              <button
                type="button"
                onClick={() => setMovementType('damage')}
                className={`py-2 rounded-xl font-bold text-xs border ${
                  movementType === 'damage' ? 'bg-rose-700 text-white border-rose-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                Damaged / Lost (-Stock)
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Quantity {movementType === 'damage' ? 'Damaged / Removed' : movementType === 'return' ? 'Returned' : 'Delta (+ or -)'}
            </label>
            <input
              type="number"
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-center text-sm"
              required
            />
            <span className="text-[11px] text-slate-500 block mt-1">
              Current stock: {currentStock} units → New stock will be:{' '}
              <strong className="text-slate-900">
                {movementType === 'damage'
                  ? Math.max(0, currentStock - Math.abs(quantity))
                  : currentStock + quantity}
              </strong>
            </span>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Reason / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Broken packaging during transit / Stock audit count"
              className="w-full p-2 rounded-xl border border-slate-200 bg-white"
              required
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Record Movement & Audit Trail
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
