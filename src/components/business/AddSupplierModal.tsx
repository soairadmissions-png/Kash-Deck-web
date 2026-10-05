import React, { useState } from 'react';
import { X, Truck, Phone, Mail, Package, CheckCircle2 } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (supplierName: string) => void;
}

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { addSupplier } = useFinancial();
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [productsSupplied, setProductsSupplied] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSup = {
      name: name.trim(),
      contactPerson: contactPerson.trim() || 'Procurement Agent',
      phone: phone.trim() || '+234 800 000 0000',
      email: email.trim() || `sales@${name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}.ng`,
      productsSupplied: productsSupplied
        ? productsSupplied.split(',').map(s => s.trim()).filter(Boolean)
        : ['Wholesale Stock'],
      amountOwed: 0,
      totalPurchases: 0,
      amountPaid: 0,
      lastOrderDate: 'None',
      status: 'Active' as const
    };

    addSupplier(newSup);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setProductsSupplied('');
    onClose();
    if (onSuccess) {
      onSuccess(newSup.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Supplier</h3>
              <p className="text-[11px] text-slate-500">Record vendor contact for purchase orders & payables.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Supplier / Company Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ABC Wholesale, Lagos Fabrics Ltd"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Contact Person / Representative
            </label>
            <input
              type="text"
              placeholder="e.g. Alhaji Bashir, Mr. Okon"
              value={contactPerson}
              onChange={e => setContactPerson(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+234 803 000 0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  placeholder="orders@supplier.ng"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Products Supplied (comma-separated)
            </label>
            <div className="relative">
              <Package className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Cotton Shirts, Denims, Shoes"
                value={productsSupplied}
                onChange={e => setProductsSupplied(e.target.value)}
                className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-900"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs transition-colors"
            >
              Save Supplier
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
      </div>
    </div>
  );
};
