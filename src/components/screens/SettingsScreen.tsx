import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Bell,
  CreditCard,
  Sliders,
  Building2,
  Lock,
  CheckCircle2,
  RotateCcw,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { useAuth } from '../../context/AuthContext';
import { BankLogo } from '../common/BankLogo';

export const SettingsScreen: React.FC = () => {
  const { accounts, setCurrentScreen, disconnectAccount } = useFinancial();
  const { user, activeWorkspace } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'accounts' | 'preferences'>('profile');

  // Preferences
  const [userName, setUserName] = useState(user?.name || 'Account Owner');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [userPhone, setUserPhone] = useState(user?.phone || '+234 800 000 0000');
  const [currency, setCurrency] = useState('₦ (Nigerian Naira)');
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [notifs, setNotifs] = useState({
    budget: true,
    upcoming: true,
    lowBalance: true,
    milestones: true,
    weeklyDigest: false
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal profile, linked Nigerian bank accounts, and alert triggers.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'accounts', label: 'Connected Accounts', icon: CreditCard },
          { id: 'security', label: 'Security', icon: ShieldCheck },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'preferences', label: 'Preferences', icon: Sliders }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-[#047857] text-[#047857]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-6">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="Ada"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500/20"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">{userName}</h3>
              <p className="text-xs text-slate-400">Account ID: CSH-2026-8910</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-600 font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Email Address</label>
              <input
                type="email"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-600 font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number (+234)</label>
              <input
                type="tel"
                value={userPhone}
                onChange={e => setUserPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-600 font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Currency</label>
              <input
                type="text"
                disabled
                value={currency}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100/70 text-slate-500 font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#047857] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* Connected Accounts & Privacy Consent Tab (Section 34) */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {/* Identity & Compliance Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Identity & Financial Authority Reference</h3>
                <p className="text-xs text-slate-500">Authorized customer profile linking your financial accounts</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full font-bold text-[10px] flex items-center gap-1 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Identity Verified</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150">
                <span className="text-slate-400 block text-[10px]">CashDeck Internal ID</span>
                <span className="font-mono font-bold text-slate-800 text-xs">usr_cd_489201</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150">
                <span className="text-slate-400 block text-[10px]">Identity Document (Masked)</span>
                <span className="font-mono font-bold text-slate-800 text-xs">NIN: •••••••1842</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150">
                <span className="text-slate-400 block text-[10px]">Financial Data Provider</span>
                <span className="font-bold text-emerald-800 text-xs truncate block">Nigerian Open Banking Adapter</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-150 text-[11px] text-emerald-950 space-y-1">
              <strong>Explicit Permissions Granted:</strong>
              <div className="flex flex-wrap gap-2 pt-0.5">
                <span className="px-2 py-0.5 bg-white rounded-md border border-emerald-200 font-semibold">✓ Account information</span>
                <span className="px-2 py-0.5 bg-white rounded-md border border-emerald-200 font-semibold">✓ Balance information</span>
                <span className="px-2 py-0.5 bg-white rounded-md border border-emerald-200 font-semibold">✓ Transaction history</span>
              </div>
            </div>
          </div>

          {/* Connected Institutions List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Connected Financial Institutions</h3>
                <p className="text-xs text-slate-500">Live feeds automatically providing your account and transaction data</p>
              </div>
              <button
                onClick={() => setCurrentScreen('providers')}
                className="px-3.5 py-1.5 bg-[#047857] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                + Connect Bank
              </button>
            </div>

            <div className="space-y-3">
              {accounts.filter(a => a.status !== 'disconnected').map(acc => (
                <div
                  key={acc.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <BankLogo bankName={acc.bankName} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-sm">{acc.bankName}</p>
                        <span className="font-mono text-slate-400 text-xs">
                          {acc.maskedAccountNumber || '•••• 4821'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {acc.name} • {acc.type === 'bank' ? 'Current/Checking' : acc.type}
                      </p>
                      <span className="text-[10px] text-emerald-800 font-medium">
                        Last synced: {acc.lastSyncedAt || 'Updated just now'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="font-black text-slate-900 text-sm block">
                        ₦{acc.balance.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        • Verified Feed
                      </span>
                    </div>

                    <button
                      onClick={() => disconnectAccount(acc.id)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center gap-1 transition-colors"
                      title="Disconnect and stop synchronization"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-5 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Security & Privacy</h3>
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 space-y-1">
            <p className="font-bold text-emerald-950">Bank-Grade 256-bit AES Encryption</p>
            <p className="text-emerald-800/80 leading-relaxed text-[11px]">
              CashDeck maintains read-only tokenized integrations. We cannot execute fund transfers, debit your accounts, or view banking passwords.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">Biometric & Fingerprint Login</p>
                <p className="text-[11px] text-slate-400">Require TouchID / FaceID to view balances</p>
              </div>
              <input
                type="checkbox"
                checked={biometricLogin}
                onChange={e => setBiometricLogin(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">Two-Factor Authentication (2FA)</p>
                <p className="text-[11px] text-slate-400">Enabled on phone ending in ••• 5678</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                Active
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Notification Triggers</h3>
          <p className="text-slate-500 text-[11px]">
            CashDeck operates with calm notification discipline — no spam or unsolicited promotional alerts.
          </p>

          <div className="space-y-2.5 pt-2">
            {[
              { key: 'budget', label: 'Budget Limit Warnings', desc: 'Alert when a category spending hits 80% and 100%' },
              { key: 'upcoming', label: 'Upcoming Bills & Rent', desc: 'Gentle reminders 3 days before payment dates' },
              { key: 'lowBalance', label: 'Low Account Balance', desc: 'Trigger when account drops below ₦50,000 buffer' },
              { key: 'milestones', label: 'Savings Milestones', desc: 'Milestone celebration when reaching goal targets' }
            ].map(item => (
              <label
                key={item.key}
                className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
              >
                <div>
                  <p className="font-bold text-slate-900">{item.label}</p>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={(notifs as any)[item.key]}
                  onChange={e =>
                    setNotifs(p => ({
                      ...p,
                      [item.key]: e.target.checked
                    }))
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Regional & Display Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Base Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full max-w-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
              >
                <option>₦ (Nigerian Naira - NGN)</option>
                <option>$ (US Dollar - USD)</option>
                <option>£ (British Pound - GBP)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Timezone</label>
              <input
                type="text"
                disabled
                value="Africa/Lagos (GMT+1)"
                className="w-full max-w-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-medium text-slate-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
