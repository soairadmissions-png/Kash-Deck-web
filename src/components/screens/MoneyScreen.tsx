import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Layers,
  ArrowLeft,
  AlertTriangle,
  Wallet,
  Trash2,
  Lock,
  Zap,
  X
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { BankLogo } from '../common/BankLogo';
import { ConnectBankModal } from '../common/ConnectBankModal';
import { DonutChart } from '../common/DonutChart';
import { CurrencyWaveVector, SecurityPatternVector } from '../common/UiVectors';
import { Account, Transaction } from '../../types';
import { api } from '../../services/api';

export const MoneyScreen: React.FC = () => {
  const {
    accounts,
    transactions,
    budgets,
    personalMetrics,
    setCurrentScreen,
    openDetail,
    dateRange,
    selectedMoneyAccountId,
    setSelectedMoneyAccountId,
    isSyncing,
    refreshAccount,
    reconnectAccount,
    disconnectAccount,
    addCashTransaction,
    hideBalances,
    toggleHideBalances
  } = useFinancial();

  const [searchFilter, setSearchFilter] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Disconnect Confirmation Modal State
  const [accountToDisconnect, setAccountToDisconnect] = useState<Account | null>(null);

  // Add Cash Transaction Modal State
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashDescription, setCashDescription] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cashCategory, setCashCategory] = useState('Groceries');
  const [cashClassification, setCashClassification] = useState<'Personal' | 'Business'>('Personal');

  // Dev simulation banner (hidden in production paths)
  const [showDevToolbar, setShowDevToolbar] = useState(false);

  // Connected personal accounts (excluding business only accounts)
  const connectedAccounts = useMemo(() => {
    return accounts.filter(a => !a.isBusiness && a.status !== 'disconnected');
  }, [accounts]);

  // Combined total balance of all connected accounts
  const combinedTotalBalance = useMemo(() => {
    return connectedAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  }, [connectedAccounts]);

  // Active account if one is selected
  const activeAccount = useMemo(() => {
    if (selectedMoneyAccountId === 'all') return null;
    return accounts.find(a => a.id === selectedMoneyAccountId) || null;
  }, [accounts, selectedMoneyAccountId]);

  // Accounts requiring attention (e.g. token expired, re-auth needed)
  const attentionAccounts = useMemo(() => {
    return connectedAccounts.filter(a => a.status === 'needs_attention');
  }, [connectedAccounts]);

  // Filter transactions based on selected account
  const accountTransactions = useMemo(() => {
    let list = transactions;

    // Filter by account
    if (selectedMoneyAccountId !== 'all' && activeAccount) {
      list = list.filter(t => t.accountId === activeAccount.id);
    }

    // Filter by direction (inflow / outflow)
    if (directionFilter === 'inflow') {
      list = list.filter(t => t.amount > 0 || t.direction === 'inflow' || t.type === 'income');
    } else if (directionFilter === 'outflow') {
      list = list.filter(t => t.amount < 0 || t.direction === 'outflow' || t.type === 'expense');
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      list = list.filter(t => t.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Filter by search
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        t =>
          t.description.toLowerCase().includes(q) ||
          (t.accountName && t.accountName.toLowerCase().includes(q)) ||
          (t.referenceId && t.referenceId.toLowerCase().includes(q)) ||
          (t.merchantOrParty && t.merchantOrParty.toLowerCase().includes(q)) ||
          (t.sender && t.sender.toLowerCase().includes(q)) ||
          (t.recipient && t.recipient.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // Chronological sorting (newest first)
    return [...list].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [transactions, selectedMoneyAccountId, activeAccount, directionFilter, categoryFilter, searchFilter]);

  // Group transactions by Date label (Section 13, 14, 15)
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};

    accountTransactions.forEach(tx => {
      const txDate = tx.date;
      let label = txDate;

      if (txDate === '2026-10-02') {
        label = 'Today';
      } else if (txDate === '2026-10-01') {
        label = 'Yesterday';
      } else {
        try {
          const parsed = new Date(txDate);
          if (!isNaN(parsed.getTime())) {
            label = parsed.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });
          }
        } catch {
          label = txDate;
        }
      }

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(tx);
    });

    return groups;
  }, [accountTransactions]);

  const handleRefresh = async () => {
    await refreshAccount(selectedMoneyAccountId);
    setSyncToast('Account data synchronized successfully.');
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleCopyRef = (e: React.MouseEvent, refId: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(refId);
    setCopiedRef(refId);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleConfirmDisconnect = async () => {
    if (!accountToDisconnect) return;
    try {
      await api.disconnectAccount(accountToDisconnect.id);
      disconnectAccount(accountToDisconnect.id);
      setSyncToast(`${accountToDisconnect.bankName} disconnected.`);
      setAccountToDisconnect(null);
      setTimeout(() => setSyncToast(null), 3000);
    } catch {
      disconnectAccount(accountToDisconnect.id);
      setAccountToDisconnect(null);
    }
  };

  const handleSaveCashTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(cashAmount);
    if (!cashDescription || isNaN(amt)) return;

    try {
      await api.addCashTransaction(cashDescription, amt, cashCategory, cashClassification);
      addCashTransaction(cashDescription, amt, cashCategory, cashClassification);
      setCashDescription('');
      setCashAmount('');
      setIsCashModalOpen(false);
      setSyncToast('Cash transaction recorded.');
      setTimeout(() => setSyncToast(null), 3000);
    } catch {
      addCashTransaction(cashDescription, amt, cashCategory, cashClassification);
      setIsCashModalOpen(false);
    }
  };

  // Dev Tool: Simulate Inbound Webhook
  const handleSimulateWebhook = async () => {
    try {
      const res = await api.simulateWebhook('gtb_01', 75000, 'Direct Deposit from Apex Ltd');
      await refreshAccount('all');
      setSyncToast(res.message || 'Simulated incoming webhook received.');
      setTimeout(() => setSyncToast(null), 3500);
    } catch (err: any) {
      setSyncToast('Webhook simulation processed.');
      setTimeout(() => setSyncToast(null), 3000);
    }
  };

  // Dev Tool: Simulate Connection Error
  const handleSimulateAttention = async () => {
    try {
      const targetId = activeAccount?.id || connectedAccounts[0]?.id;
      await api.simulateAttention(targetId);
      await refreshAccount('all');
      setSyncToast('Account connection marked as needing attention.');
      setTimeout(() => setSyncToast(null), 3500);
    } catch {
      setSyncToast('Simulated connection error.');
      setTimeout(() => setSyncToast(null), 3000);
    }
  };

  // Spending donut segments
  const spendingSegments = [
    { label: 'Transport', percentage: 32, amount: 134400, color: '#0d9488' },
    { label: 'Food & Dining', percentage: 22, amount: 92400, color: '#10b981' },
    { label: 'Shopping', percentage: 16, amount: 67200, color: '#8b5cf6' },
    { label: 'Bills & Utilities', percentage: 12, amount: 50400, color: '#f59e0b' },
    { label: 'Others', percentage: 18, amount: 75600, color: '#64748b' }
  ];

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {syncToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-emerald-700/50 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* DEV / TESTING CONTROL BAR (Sections 38 & 39) */}
      {showDevToolbar && (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-sm border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <strong className="text-emerald-400 font-bold">Live Provider Simulation Mode:</strong>{' '}
              <span className="text-slate-300">Nigerian Open Banking Adapter (Automated sync & deduplication)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSimulateWebhook}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 rounded-lg font-semibold flex items-center gap-1 transition-colors text-[11px]"
              title="Triggers real inbound webhook to test deduplication & background sync"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulate Webhook (+₦75,000)</span>
            </button>
            <button
              onClick={handleSimulateAttention}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 rounded-lg font-semibold flex items-center gap-1 transition-colors text-[11px]"
              title="Simulates expired session to test error recovery flow"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Re-auth Needed</span>
            </button>
            <button
              onClick={() => setShowDevToolbar(false)}
              className="text-slate-400 hover:text-white p-1 text-[11px]"
              title="Dismiss toolbar"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* STALE DATA / RE-AUTH REQUIRED RECOVERY BANNER (Sections 21 & 22) */}
      {attentionAccounts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                Connection needs attention
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                We need you to reconnect {attentionAccounts.map(a => a.bankName).join(', ')} before we can update recent balances and transactions.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              attentionAccounts.forEach(a => reconnectAccount(a.id));
              setSyncToast('Account re-authenticated successfully.');
              setTimeout(() => setSyncToast(null), 3000);
            }}
            className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* 1. TOP HEADER & BALANCE SECTION (Sections 10, 13, 14) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 lg:p-7 border border-slate-200/80 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background gradient & UI vectors */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-50/50 via-teal-50/20 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-80 h-28 pointer-events-none opacity-25 hidden sm:block">
          <CurrencyWaveVector className="text-emerald-700" />
        </div>
        <div className="absolute right-10 -top-10 w-44 h-44 pointer-events-none opacity-15 hidden md:block">
          <SecurityPatternVector className="text-emerald-900" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Balance Block */}
          <div>
            {activeAccount ? (
              /* SPECIFIC ACCOUNT CONTEXT (Section 14) */
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedMoneyAccountId('all')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors bg-emerald-50 px-2.5 py-1 rounded-lg"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>All Accounts</span>
                  </button>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <span className="capitalize">{activeAccount.type} Account</span>
                    <span>•</span>
                    <span className="font-mono">{activeAccount.maskedAccountNumber || '••••'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <BankLogo bankName={activeAccount.bankName} size="md" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {activeAccount.bankName}
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">
                      Available balance
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {hideBalances ? '₦••••••••' : `₦${activeAccount.balance.toLocaleString()}`}
                  </span>
                  <button
                    onClick={toggleHideBalances}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title={hideBalances ? 'Show balance' : 'Hide balance'}
                  >
                    {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Synchronization status */}
                <div className="flex items-center gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>{activeAccount.lastSyncedAt || 'Updated just now'}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={handleRefresh}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-emerald-800 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-700' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Refresh'}</span>
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={() => setAccountToDisconnect(activeAccount)}
                    className="text-rose-600 hover:text-rose-800 font-semibold text-[11px] transition-colors"
                  >
                    Disconnect account
                  </button>
                </div>
              </div>
            ) : (
              /* ALL ACCOUNTS COMBINED CONTEXT (Section 10 & 13) */
              <div className="space-y-1.5">
                <span className="text-xs sm:text-sm font-semibold text-slate-500 block uppercase tracking-wider">
                  Total balance
                </span>
                <div className="flex items-baseline gap-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                    {hideBalances ? '₦••••••••' : `₦${combinedTotalBalance.toLocaleString()}`}
                  </h1>
                  <button
                    onClick={toggleHideBalances}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title={hideBalances ? 'Show balance' : 'Hide balance'}
                  >
                    {hideBalances ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Synchronization status matching Section 10 & 20 */}
                <div className="flex items-center gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>Updated just now</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={handleRefresh}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-emerald-800 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-700' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Refresh'}</span>
                  </button>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 text-[11px]">
                    {connectedAccounts.length} connected accounts
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Date Range & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-2xs">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateRange}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            <button
              onClick={() => setIsCashModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-700" />
              <span>+ Add cash transaction</span>
            </button>

            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Connect account</span>
            </button>
          </div>
        </div>

        {/* 2. HORIZONTAL ACCOUNT STRIP (Sections 11 & 12) */}
        <div className="mt-7 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Connected Accounts
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              {connectedAccounts.length} active institutions
            </span>
          </div>

          {/* Horizontally scrollable row on mobile and desktop */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none select-none">
            {/* "All Accounts" Selector Card */}
            <div
              onClick={() => setSelectedMoneyAccountId('all')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer shrink-0 min-w-[210px] transition-all ${
                selectedMoneyAccountId === 'all'
                  ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200/70 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedMoneyAccountId === 'all'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900">All Accounts</h4>
                  {selectedMoneyAccountId === 'all' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Combined</p>
                <p className="text-xs font-black text-slate-900 mt-0.5">
                  {hideBalances ? '₦••••••••' : `₦${combinedTotalBalance.toLocaleString()}`}
                </p>
              </div>
            </div>

            {/* Individual Connected Bank Cards (Section 11) */}
            {connectedAccounts.map(account => {
              const isSelected = selectedMoneyAccountId === account.id;
              const hasAttention = account.status === 'needs_attention';

              return (
                <div
                  key={account.id}
                  onClick={() => setSelectedMoneyAccountId(account.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer shrink-0 min-w-[210px] transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                      : hasAttention
                      ? 'bg-amber-50/50 border-amber-300'
                      : 'bg-slate-50/60 border-slate-200/70 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <BankLogo bankName={account.bankName} size="md" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                        {account.bankName}
                      </h4>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      )}
                      {hasAttention && (
                        <span title="Connection needs attention">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {account.maskedAccountNumber || '•••• 0000'}
                    </p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">
                      {hideBalances ? '₦••••••••' : `₦${account.balance.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* + Connect Bank Quick Button in the strip */}
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-dashed border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/30 text-slate-600 hover:text-emerald-800 text-xs font-bold shrink-0 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Connect bank</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE GRID: Transaction Feed + Right Financial Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: TRANSACTIONS FEED (Sections 13, 14, 15, 27) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Transactions
                  </h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px] font-semibold">
                    {accountTransactions.length}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedMoneyAccountId === 'all'
                    ? 'Showing activity across all connected accounts'
                    : `Showing activity for ${activeAccount?.bankName} (${activeAccount?.maskedAccountNumber})`}
                </p>
              </div>

              {/* Inflow / Outflow filter tabs */}
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
                <button
                  onClick={() => setDirectionFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    directionFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setDirectionFilter('inflow')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    directionFilter === 'inflow'
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Money in (↓)
                </button>
                <button
                  onClick={() => setDirectionFilter('outflow')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    directionFilter === 'outflow'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Money out (↑)
                </button>
              </div>
            </div>

            {/* Search and Category Filter Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Search description, recipient, reference ID..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                >
                  <option value="all">All Categories</option>
                  <option value="transfer">Transfers</option>
                  <option value="groceries">Groceries</option>
                  <option value="income">Income</option>
                  <option value="business">Business</option>
                  <option value="personal">Personal</option>
                  <option value="receivable">Receivables</option>
                  <option value="food & dining">Food & Dining</option>
                </select>
              </div>
            </div>

            {/* 4 & 5. CHRONOLOGICAL TRANSACTION FEED GROUPED BY DATE */}
            <div className="space-y-6 pt-2">
              {Object.keys(groupedTransactions).length === 0 ? (
                <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">No transactions found</h4>
                  <p className="text-[11px] text-slate-400">
                    Try adjusting your filters or connect an account with recent activity.
                  </p>
                </div>
              ) : (
                Object.entries(groupedTransactions).map(([dateLabel, txList]) => (
                  <div key={dateLabel} className="space-y-2">
                    {/* Date Header: Today / Yesterday / October 2, 2026 */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {dateLabel}
                      </span>
                      <div className="h-px bg-slate-100 flex-1" />
                    </div>

                    {/* Transaction Items */}
                    <div className="space-y-1.5">
                      {txList.map(tx => {
                        const isInflow = tx.amount > 0 || tx.direction === 'inflow' || tx.type === 'income';
                        const isCash = tx.isCashEntry || tx.channel === 'Cash';

                        return (
                          <div
                            key={tx.id}
                            onClick={() => openDetail('transaction', tx)}
                            className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border border-slate-100 hover:border-emerald-300/80 bg-white hover:bg-slate-50/70 cursor-pointer transition-all group shadow-2xs"
                          >
                            {/* Left: Direction Badge + Details */}
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Direction Arrow: ↓ green for credit, ↑ slate for debit */}
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  isInflow
                                    ? 'bg-emerald-100/70 text-emerald-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {isInflow ? (
                                  <ArrowDownLeft className="w-4 h-4 text-emerald-800 stroke-[2.5]" />
                                ) : (
                                  <ArrowUpRight className="w-4 h-4 text-slate-700 stroke-[2.5]" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-bold text-xs sm:text-sm text-slate-900 truncate group-hover:text-emerald-950 transition-colors">
                                    {tx.description}
                                  </p>

                                  {/* Distinction between SYNCED BANK TRANSACTION and CASH ENTRY (Section 27) */}
                                  {isCash ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                      Cash Entry
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-800">
                                      Synced
                                    </span>
                                  )}

                                  {tx.status !== 'Completed' && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700">
                                      {tx.status}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                                  {/* Bank Logo & Name Identification (Section 13) */}
                                  <div className="flex items-center gap-1">
                                    <BankLogo bankName={tx.accountName} size="sm" className="w-4 h-4 text-[9px] rounded-xs" />
                                    <span className="font-semibold text-slate-700">
                                      {tx.accountName}
                                    </span>
                                    {tx.accountMasked && (
                                      <span className="font-mono text-slate-400">
                                        {tx.accountMasked}
                                      </span>
                                    )}
                                  </div>

                                  <span>•</span>
                                  <span>{tx.time || tx.date}</span>

                                  {tx.referenceId && (
                                    <>
                                      <span>•</span>
                                      <button
                                        onClick={e => handleCopyRef(e, tx.referenceId!)}
                                        className="hover:text-slate-700 font-mono transition-colors flex items-center gap-0.5"
                                        title="Click to copy reference"
                                      >
                                        <span>{tx.referenceId}</span>
                                        <Copy className="w-2.5 h-2.5 opacity-60" />
                                        {copiedRef === tx.referenceId && (
                                          <span className="text-[9px] text-emerald-700 font-bold ml-0.5">
                                            Copied!
                                          </span>
                                        )}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right: Amount & Category Badge */}
                            <div className="text-right shrink-0 ml-3">
                              <span
                                className={`text-xs sm:text-sm font-black block tracking-tight ${
                                  isInflow ? 'text-emerald-800' : 'text-slate-900'
                                }`}
                              >
                                {hideBalances
                                  ? '••••••'
                                  : `${isInflow ? '+' : ''}₦${Math.abs(tx.amount).toLocaleString()}`}
                              </span>
                              <div className="flex items-center gap-1 justify-end mt-0.5">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                                  {tx.category}
                                </span>
                                {tx.isBusiness && (
                                  <span className="px-1.5 py-0.5 bg-teal-50 text-teal-800 text-[9px] font-bold rounded">
                                    Biz
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT 1 COL: SPENDING BY CATEGORY & BUDGETS & ACCOUNT STATS */}
        <div className="xl:col-span-1 space-y-6">
          {/* Active Account Quick Metadata (if an account is selected) */}
          {activeAccount && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Account Overview
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  <span>Direct Bank Feed</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Institution</span>
                  <span className="font-bold text-slate-800">{activeAccount.bankName}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Account Type</span>
                  <span className="font-bold text-slate-800 capitalize">{activeAccount.type}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Account Number</span>
                  <span className="font-mono font-bold text-slate-800">
                    {activeAccount.maskedAccountNumber || '•••• 4821'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Status</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>Active Sync</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setSelectedMoneyAccountId('all')}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  All Accounts
                </button>
                <button
                  onClick={() => setAccountToDisconnect(activeAccount)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          )}

          {/* Spending by Category Donut Chart */}
          <DonutChart
            title="Spending by Category"
            totalLabel="Total Spent"
            totalAmount={personalMetrics.expenses}
            segments={spendingSegments}
            onViewAll={() => setCurrentScreen('budgets')}
          />

          {/* Monthly Budgets Summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Monthly Budgets</h3>
              <button
                onClick={() => setCurrentScreen('budgets')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {budgets.slice(0, 3).map(b => {
                const percent = Math.min(100, Math.round((b.spent / b.monthlyLimit) * 100));

                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{b.name}</span>
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="font-semibold text-slate-700">
                          ₦{b.spent.toLocaleString()} / ₦{b.monthlyLimit.toLocaleString()}
                        </span>
                        <span className="font-bold text-slate-900 ml-1">{percent}%</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* DISCONNECT ACCOUNT CONFIRMATION MODAL (Section 23) */}
      {accountToDisconnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <BankLogo bankName={accountToDisconnect.bankName} size="md" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Disconnect {accountToDisconnect.bankName}?
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {accountToDisconnect.maskedAccountNumber}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-150">
              CashDeck will stop receiving new information from this account. Previously synchronized information will be handled according to your data-retention settings.
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setAccountToDisconnect(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisconnect}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CASH TRANSACTION MODAL (Section 27) */}
      {isCashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Record Cash Transaction</h3>
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                    Manual Cash Entry
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCashModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Cash transactions are recorded separately and are never represented as synced bank data.
            </p>

            <form onSubmit={handleSaveCashTransaction} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fuel purchase at station, Cash received from buyer"
                  value={cashDescription}
                  onChange={e => setCashDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount (₦)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000 (positive for inflow, negative for expense)"
                  value={cashAmount}
                  onChange={e => setCashAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={cashCategory}
                    onChange={e => setCashCategory(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Transport">Transport</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Business">Business</option>
                    <option value="Personal">Personal</option>
                    <option value="Income">Cash Sale</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Classification</label>
                  <select
                    value={cashClassification}
                    onChange={e => setCashClassification(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  Save Cash Entry
                </button>
                <button
                  type="button"
                  onClick={() => setIsCashModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zero-Manual-Entry Bank Connection Modal (Sections 7 & 8) */}
      <ConnectBankModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </div>
  );
};
