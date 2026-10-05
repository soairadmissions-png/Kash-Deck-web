import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Loader2,
  Building2,
  CreditCard,
  Wallet
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { financialProvidersList } from '../../data/initialData';
import { FinancialProvider, AccountType } from '../../types';

export const FinancialProvidersScreen: React.FC = () => {
  const { setCurrentScreen, connectBankAccounts } = useFinancial();

  const [activeCategory, setActiveCategory] = useState<'All' | 'Banks' | 'Cards' | 'Wallets' | 'Other'>('All');
  const [searchFilter, setSearchFilter] = useState('');

  // Selected provider for modal connection
  const [selectedProvider, setSelectedProvider] = useState<FinancialProvider | null>(null);
  const [connectionStep, setConnectionStep] = useState<'select' | 'connecting' | 'chooseAccounts' | 'success'>('select');
  const [selectedAccountsToAdd, setSelectedAccountsToAdd] = useState<{ [key: string]: boolean }>({
    current: true,
    savings: true
  });
  const [supportRequested, setSupportRequested] = useState(false);

  const categories = ['All', 'Banks', 'Cards', 'Wallets', 'Other'] as const;

  const filteredProviders = financialProvidersList.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const banks = filteredProviders.filter(p => p.category === 'Banks');
  const cards = filteredProviders.filter(p => p.category === 'Cards');
  const wallets = filteredProviders.filter(p => p.category === 'Wallets');

  const startConnect = (provider: FinancialProvider) => {
    setSelectedProvider(provider);
    setConnectionStep('connecting');
    setTimeout(() => {
      setConnectionStep('chooseAccounts');
    }, 1200);
  };

  const handleConfirmAddAccounts = () => {
    if (!selectedProvider) return;

    const accountsToInsert: { name: string; balance: number; type: AccountType; isBusiness?: boolean }[] = [];

    if (selectedAccountsToAdd.current) {
      accountsToInsert.push({
        name: 'Current Account',
        balance: 750000,
        type: selectedProvider.category === 'Wallets' ? 'wallet' : 'bank',
        isBusiness: false
      });
    }

    if (selectedAccountsToAdd.savings) {
      accountsToInsert.push({
        name: 'Savings Reserve',
        balance: 420000,
        type: selectedProvider.category === 'Wallets' ? 'wallet' : 'bank',
        isBusiness: false
      });
    }

    connectBankAccounts(selectedProvider.name, accountsToInsert);
    setConnectionStep('success');
    setTimeout(() => {
      setSelectedProvider(null);
      setConnectionStep('select');
      setCurrentScreen('accounts');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Title */}
      <div>
        <button
          onClick={() => setCurrentScreen('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Financial Providers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Connect your bank and financial accounts to get the most out of CashDeck.
        </p>
      </div>

      {/* Main Grid: 2 Cols Left, 1 Col Right Security Info */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Providers Directory */}
        <div className="xl:col-span-2 space-y-6">
          {/* Search & Category Filter Bar matching screenshot */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search for a bank or provider..."
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-[#047857] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/70 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Banks Section */}
          {(activeCategory === 'All' || activeCategory === 'Banks') && banks.length > 0 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Banks</h3>
                <p className="text-xs text-slate-500">
                  Connect your bank accounts to track transactions, monitor balances and more.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {banks.map(bank => (
                  <div
                    key={bank.id}
                    onClick={() => startConnect(bank)}
                    className="bg-white rounded-2xl p-4 border border-slate-200/70 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-xs"
                        style={{
                          backgroundColor: bank.logoBg,
                          color: bank.logoTextColor
                        }}
                      >
                        {bank.logoLetter}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {bank.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {bank.tagline}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cards Section */}
          {(activeCategory === 'All' || activeCategory === 'Cards') && cards.length > 0 && (
            <div className="space-y-3 pt-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cards</h3>
                <p className="text-xs text-slate-500">
                  Link your debit or credit cards for easier tracking and spending insights.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {cards.map(card => (
                  <div
                    key={card.id}
                    onClick={() => startConnect(card)}
                    className="bg-white rounded-2xl p-4 border border-slate-200/70 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-xs"
                        style={{
                          backgroundColor: card.logoBg,
                          color: card.logoTextColor
                        }}
                      >
                        {card.logoLetter}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {card.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {card.tagline}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wallets & Other Providers */}
          {(activeCategory === 'All' || activeCategory === 'Wallets') && wallets.length > 0 && (
            <div className="space-y-3 pt-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Wallets & Other Providers</h3>
                <p className="text-xs text-slate-500">
                  Connect e-wallets and other financial services to keep everything in one place.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {wallets.map(wallet => (
                  <div
                    key={wallet.id}
                    onClick={() => startConnect(wallet)}
                    className="bg-white rounded-2xl p-4 border border-slate-200/70 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-xs"
                        style={{
                          backgroundColor: wallet.logoBg,
                          color: wallet.logoTextColor
                        }}
                      >
                        {wallet.logoLetter}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {wallet.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {wallet.tagline}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Bank Help Notice matching screenshot */}
          <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                i
              </div>
              <div>
                <p className="font-bold text-emerald-950">Don't see your bank or provider?</p>
                <p className="text-emerald-800/80 text-[11px] mt-0.5">
                  We're constantly adding more financial institutions. Check back soon or request manual import.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSupportRequested(true);
                setTimeout(() => setSupportRequested(false), 3500);
              }}
              className="px-4 py-2 bg-white text-emerald-900 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors text-xs whitespace-nowrap shadow-2xs"
            >
              {supportRequested ? 'Support Request Sent ✓' : 'Contact Support'}
            </button>
          </div>
        </div>

        {/* Right Info Card matching screenshot */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-xs space-y-6">
            {/* Visual Bank Graphic */}
            <div className="w-full py-6 flex items-center justify-center bg-emerald-50/50 rounded-2xl border border-emerald-100/60">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#047857] to-[#10b981] flex items-center justify-center text-white shadow-lg">
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="absolute -top-2 -right-3 w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="absolute -bottom-2 -left-3 w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Why connect your accounts?
              </h3>
              <ul className="mt-3.5 space-y-3 text-xs text-slate-600">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Track your transactions automatically</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Get real-time balance updates</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>See your spending patterns & trends</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Receive calm financial insights</span>
                </li>
              </ul>
            </div>

            {/* Security Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Your security matters</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                We use bank-level 256-bit encryption. CashDeck has read-only access and never stores your banking credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Flow Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden p-6 text-center space-y-4">
            {connectionStep === 'connecting' && (
              <div className="py-8 space-y-4">
                <div
                  className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-xl font-bold text-white shadow-md animate-pulse"
                  style={{ backgroundColor: selectedProvider.logoBg }}
                >
                  {selectedProvider.logoLetter}
                </div>
                <div className="flex items-center justify-center gap-2 text-emerald-700">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-bold">
                    Connecting to {selectedProvider.name}...
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Establishing secure encrypted handshake with banking portal
                </p>
              </div>
            )}

            {connectionStep === 'chooseAccounts' && (
              <div className="space-y-4 text-left">
                <div className="text-center pb-2 border-b border-slate-100">
                  <div
                    className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-sm font-bold text-white shadow-xs mb-2"
                    style={{ backgroundColor: selectedProvider.logoBg }}
                  >
                    {selectedProvider.logoLetter}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Choose accounts to add
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select the {selectedProvider.name} accounts to sync with CashDeck.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAccountsToAdd.current}
                        onChange={e =>
                          setSelectedAccountsToAdd(p => ({
                            ...p,
                            current: e.target.checked
                          }))
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Current Account</p>
                        <p className="text-[11px] text-slate-400">•••• 8912</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">₦750,000</span>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAccountsToAdd.savings}
                        onChange={e =>
                          setSelectedAccountsToAdd(p => ({
                            ...p,
                            savings: e.target.checked
                          }))
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Savings Reserve</p>
                        <p className="text-[11px] text-slate-400">•••• 4109</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">₦420,000</span>
                  </label>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleConfirmAddAccounts}
                    className="flex-1 py-2.5 bg-[#047857] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Add selected accounts
                  </button>
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {connectionStep === 'success' && (
              <div className="py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Successfully Connected!
                </h3>
                <p className="text-xs text-slate-500">
                  Your accounts from {selectedProvider.name} are now linked and synced.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
