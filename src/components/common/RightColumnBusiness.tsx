import React from 'react';
import {
  Building2,
  Calendar,
  ChevronRight,
  Package,
  Plus,
  Landmark,
  Wallet
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const RightColumnBusiness: React.FC = () => {
  const { accounts, inventory, setCurrentScreen, openDetail } = useFinancial();

  const businessAccounts = accounts.filter(a => a.isBusiness);

  return (
    <div className="space-y-6">
      {/* Business Accounts */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Business Accounts</h3>
          <button
            onClick={() => setCurrentScreen('accounts')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {businessAccounts.map(acc => (
            <div
              key={acc.id}
              onClick={() => openDetail('account', acc)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
                  style={{ backgroundColor: acc.color || '#047857' }}
                >
                  {acc.bankName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {acc.bankName}
                  </h4>
                  <p className="text-[11px] text-slate-400 capitalize">
                    {acc.type === 'business' ? 'Business Account' : acc.type}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-900">
                  ₦{acc.balance.toLocaleString()}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-auto mt-0.5 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Business Payments / Inflows */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Upcoming</h3>
          <button
            onClick={() => setCurrentScreen('calendar')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3.5">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Supplier Payment</h4>
                <p className="text-[11px] text-slate-400">TechWorld • Oct 12</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-900">-₦600,000</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Rent Office Space</h4>
                <p className="text-[11px] text-slate-400">Lekki Office • Oct 18</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-900">-₦240,000</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Customer Payment</h4>
                <p className="text-[11px] text-slate-400">Chinedu Eze • Oct 15</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700">+₦300,000</span>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Top Products</h3>
          <button
            onClick={() => setCurrentScreen('inventory')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {inventory.slice(0, 4).map(item => (
            <div
              key={item.id}
              onClick={() => openDetail('inventory', item)}
              className="group cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-all"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-slate-400">{item.quantity} in stock</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">
                    ₦{item.sellingPrice.toLocaleString()}
                  </span>
                  <span className={`text-[10px] font-semibold ${
                    item.status === 'In stock' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
