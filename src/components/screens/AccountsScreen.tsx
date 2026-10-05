import React, { useState } from 'react';
import {
  Landmark,
  CreditCard,
  Wallet,
  TrendingUp,
  Plus,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Lock
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { Account, AccountType } from '../../types';
import { BankLogo } from '../common/BankLogo';
import { ConnectBankModal } from '../common/ConnectBankModal';
import { CurrencyWaveVector, SecurityPatternVector, CardFlowVector } from '../common/UiVectors';

export const AccountsScreen: React.FC = () => {
  const {
    accounts,
    addAccount,
    setCurrentScreen,
    openDetail,
    setSelectedMoneyAccountId,
    refreshAccount,
    isSyncing,
    hideBalances
  } = useFinancial();

  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'business'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // New Manual Account state (for physical cash only)
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('Cash');
  const [type, setType] = useState<AccountType>('cash');
  const [initialBalance, setInitialBalance] = useState('');
  const [isBusiness, setIsBusiness] = useState(false);

  const filteredAccounts = accounts.filter(a => {
    if (activeTab === 'personal') return !a.isBusiness;
    if (activeTab === 'business') return a.isBusiness;
    return true;
  });

  const totalBankBalance = filteredAccounts
    .filter(a => a.type === 'bank' || a.type === 'business')
    .reduce((s, a) => s + a.balance, 0);

  const totalCashBalance = filteredAccounts
    .filter(a => a.type === 'cash')
    .reduce((s, a) => s + a.balance, 0);

  const totalCardBalance = filteredAccounts
    .filter(a => a.type === 'card' || a.type === 'wallet')
    .reduce((s, a) => s + a.balance, 0);

  const handleCreateManualAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(initialBalance);
    if (!accountName || isNaN(bal)) return;

    addAccount({
      name: accountName,
      bankName: bankName,
      type: type,
      balance: bal,
      currency: '₦',
      isBusiness: isBusiness,
      status: 'active',
      color: type === 'cash' ? '#047857' : '#6366f1'
    });

    setAccountName('');
    setInitialBalance('');
    setShowAddModal(false);
  };

  const handleOpenInMoney = (e: React.MouseEvent, accId: string) => {
    e.stopPropagation();
    setSelectedMoneyAccountId(accId);
    setCurrentScreen('money');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connected Nigerian bank accounts, cards, mobile wallets and physical cash.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refreshAccount('all')}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-700' : 'text-slate-400'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync All'}</span>
          </button>
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Connect Bank Account</span>
          </button>
        </div>
      </div>

      {/* Info Banner: Connected Accounts Principle with Security Vector */}
      <div className="relative overflow-hidden p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-emerald-50/80 to-teal-50/50 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 pointer-events-none opacity-20">
          <SecurityPatternVector className="text-emerald-700" />
        </div>
        <div className="flex items-start sm:items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
              Automatic Bank Synchronization
            </h4>
            <p className="text-[11px] sm:text-xs text-emerald-800 leading-relaxed mt-0.5">
              Balances and transactions update automatically directly from your financial provider. No manual account reconciliation is required.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-xs font-bold text-emerald-900 hover:text-emerald-950 underline shrink-0 whitespace-nowrap relative z-10 self-start sm:self-center"
        >
          Add offline cash
        </button>
      </div>

      {/* Summary KPI Cards with responsive typography and vector flourishes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 w-28 h-14 pointer-events-none opacity-20">
            <CurrencyWaveVector className="text-emerald-600" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-semibold text-slate-500">Bank Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2 relative z-10">
            {hideBalances ? '₦••••••••' : `₦${totalBankBalance.toLocaleString()}`}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1 block relative z-10">
            Across checking & current accounts
          </span>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cash on Hand</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            {hideBalances ? '₦••••••••' : `₦${totalCashBalance.toLocaleString()}`}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Physical notes & till balance
          </span>
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 w-24 h-12 pointer-events-none opacity-25">
            <CardFlowVector className="text-purple-600" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-semibold text-slate-500">Wallets & Cards</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2 relative z-10">
            {hideBalances ? '₦••••••••' : `₦${totalCardBalance.toLocaleString()}`}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1 block relative z-10">
            Digital cards & mobile wallets
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'personal', 'business'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
              activeTab === tab
                ? 'bg-[#047857] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {tab} Accounts
          </button>
        ))}
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map(acc => (
          <div
            key={acc.id}
            onClick={() => openDetail('account', acc)}
            className="bg-white rounded-2xl p-5 border border-slate-200/70 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <BankLogo bankName={acc.bankName} size="md" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {acc.bankName}
                    </h4>
                    <p className="text-[11px] text-slate-400 capitalize">
                      {acc.name} • {acc.type}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Synced</span>
                </span>
              </div>

              <div className="mt-6">
                <span className="text-xs text-slate-400 font-medium">Available Balance</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {hideBalances ? '₦••••••••' : `₦${acc.balance.toLocaleString()}`}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">
                {acc.maskedAccountNumber || (acc.accountNumber ? `•••• ${acc.accountNumber.slice(-4)}` : 'Active')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={e => handleOpenInMoney(e, acc.id)}
                  className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors"
                >
                  <span>View in Money</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Quick Add Bank Card in Grid */}
        <div
          onClick={() => setShowConnectModal(true)}
          className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-emerald-50/20 group"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-3 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
            Connect New Bank Account
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
            Directly link GTBank, Access, UBA, Zenith, OPay, and more.
          </p>
        </div>
      </div>

      {/* Manual Cash Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Physical Cash Drawer</h3>
            <p className="text-xs text-slate-500">
              For bank accounts, use &apos;Connect Bank Account&apos; for automated balance and transaction retrieval.
            </p>
            <form onSubmit={handleCreateManualAccount} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Account / Till Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shop Cash Register, Petty Cash Envelope"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Initial Cash Amount (₦)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50000"
                  value={initialBalance}
                  onChange={e => setInitialBalance(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isBusinessCash"
                  checked={isBusiness}
                  onChange={e => setIsBusiness(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isBusinessCash" className="font-medium text-slate-700">
                  Assign to Business workspace
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  Save Cash Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Bank Modal */}
      <ConnectBankModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />
    </div>
  );
};
