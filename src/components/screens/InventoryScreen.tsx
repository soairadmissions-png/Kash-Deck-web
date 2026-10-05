import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const InventoryScreen: React.FC = () => {
  const { inventory, addInventoryItem, openDetail } = useFinancial();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Accessories');
  const [quantity, setQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [minThreshold, setMinThreshold] = useState('5');

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalStockValue = inventory.reduce((s, i) => s + i.stockValue, 0);
  const totalUnits = inventory.reduce((s, i) => s + i.quantity, 0);
  const lowStockCount = inventory.filter(i => i.status === 'Low stock' || i.status === 'Out of stock').length;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseInt(quantity) || 0;
    const c = parseFloat(costPrice) || 0;
    const sp = parseFloat(sellingPrice) || 0;
    const th = parseInt(minThreshold) || 5;

    let status: 'In stock' | 'Low stock' | 'Out of stock' = 'In stock';
    if (q === 0) status = 'Out of stock';
    else if (q <= th) status = 'Low stock';

    addInventoryItem({
      name,
      sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
      category,
      quantity: q,
      costPrice: c,
      sellingPrice: sp,
      minAlertThreshold: th,
      status
    });

    setName('');
    setSku('');
    setQuantity('');
    setCostPrice('');
    setSellingPrice('');
    setShowAddModal(false);
  };

  const handleExportCSV = () => {
    const headers = ['Product', 'SKU', 'Category', 'Quantity', 'Cost Price', 'Selling Price', 'Stock Value', 'Status'];
    const rows = filteredInventory.map(i => [
      `"${i.name.replace(/"/g, '""')}"`,
      i.sku,
      i.category,
      i.quantity,
      i.costPrice,
      i.sellingPrice,
      i.stockValue,
      i.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cashdeck_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Inventory Spreadsheet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time stock valuation, cost accounting and replenishment thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total Stock Value</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₦{totalStockValue.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            At purchase cost valuation
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total Physical Units</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {totalUnits.toLocaleString()} units
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Across {inventory.length} distinct SKUs
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Restock Alerts</span>
          <p className="text-2xl font-bold text-amber-700 mt-1">
            {lowStockCount} items
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Low or depleted inventory
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search product name, SKU, or category..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200/80 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 focus:outline-none"
          >
            <option value="all">All Stock Statuses</option>
            <option value="In stock">In stock</option>
            <option value="Low stock">Low stock</option>
            <option value="Out of stock">Out of stock</option>
          </select>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 font-semibold border-b border-slate-200 font-sans">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Stock Value</th>
                <th className="py-3 px-4 text-center font-sans">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map(item => (
                <tr
                  key={item.id}
                  onClick={() => openDetail('inventory', item)}
                  className="hover:bg-slate-50/80 cursor-pointer group transition-colors"
                >
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900 group-hover:text-emerald-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-sans">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {item.sku}
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-600">
                    {item.category}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500">
                    ₦{item.costPrice.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                    ₦{item.sellingPrice.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    ₦{item.stockValue.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center font-sans">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'In stock'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Low stock'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status === 'In stock' && <CheckCircle2 className="w-3 h-3" />}
                      {item.status === 'Low stock' && <AlertTriangle className="w-3 h-3" />}
                      {item.status === 'Out of stock' && <XCircle className="w-3 h-3" />}
                      <span>{item.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Inventory Product</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Air M2 256GB"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SKU Code</label>
                  <input
                    type="text"
                    placeholder="MBA-M2-256"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Smartphones">Smartphones</option>
                    <option value="Audio">Audio</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Laptops">Laptops</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="10"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Low Stock Alert Level</label>
                  <input
                    type="number"
                    value={minThreshold}
                    onChange={e => setMinThreshold(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cost Price (₦)</label>
                  <input
                    type="number"
                    required
                    placeholder="140000"
                    value={costPrice}
                    onChange={e => setCostPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Selling Price (₦)</label>
                  <input
                    type="number"
                    required
                    placeholder="200000"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#047857] hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  Save Product
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
