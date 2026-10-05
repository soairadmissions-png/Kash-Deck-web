import React, { useState } from 'react';
import { Search, ShieldCheck, Check, ArrowLeft } from 'lucide-react';
import { ConnectedAccountsIllustration } from '../common/AuthIllustrations';
import { BankLogo } from '../common/BankLogo';
import { apiV1 } from '../../services/apiV1';

interface ConnectAccountsStepProps {
  workspaceId: string;
  onContinue: () => void;
  onSkip: () => void;
}

interface ProviderItem {
  id: string;
  name: string;
  category: 'banks' | 'cards' | 'other';
  shortName: string;
  subLabel?: string;
}

const PROVIDERS: ProviderItem[] = [
  { id: 'gtb', name: 'GTBank', category: 'banks', shortName: 'GTB', subLabel: 'GTBank' },
  { id: 'access', name: 'Access Bank', category: 'banks', shortName: 'Access', subLabel: 'Access Bank' },
  { id: 'firstbank', name: 'First Bank', category: 'banks', shortName: 'First', subLabel: 'First Bank' },
  { id: 'uba', name: 'UBA', category: 'banks', shortName: 'UBA', subLabel: 'UBA' },
  { id: 'zenith', name: 'Zenith Bank', category: 'banks', shortName: 'Zenith', subLabel: 'Zenith Bank' },
  { id: 'kuda', name: 'Kuda', category: 'banks', shortName: 'Kuda', subLabel: 'Kuda' },
  { id: 'stanbic', name: 'Stanbic IBTC', category: 'banks', shortName: 'Stanbic', subLabel: 'Stanbic IBTC' },
  { id: 'opay', name: 'OPay', category: 'other', shortName: 'OPay', subLabel: 'OPay' }
];

interface DiscoveredAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountType: 'checking' | 'savings';
  accountNumber: string;
  balanceMinor: number;
}

export const ConnectAccountsStep: React.FC<ConnectAccountsStepProps> = ({
  workspaceId,
  onContinue,
  onSkip
}) => {
  // Sub-view: 'landing' (Screen 12) | 'catalog' (Screen 13) | 'select' (Screen 14)
  const [subView, setSubView] = useState<'landing' | 'catalog' | 'select'>('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'banks' | 'cards' | 'other'>('all');
  const [, setSelectedProvider] = useState<ProviderItem | null>(null);

  // Accounts matching reference UI Screen 14
  const [discoveredAccounts] = useState<DiscoveredAccount[]>([
    {
      id: 'acc_gtb_1',
      bankName: 'GTBank',
      accountName: 'Current Account',
      accountType: 'checking',
      accountNumber: '•••• 4921',
      balanceMinor: 125000000 // ₦1,250,000
    },
    {
      id: 'acc_gtb_2',
      bankName: 'GTBank',
      accountName: 'Savings Account',
      accountType: 'savings',
      accountNumber: '•••• 8812',
      balanceMinor: 62000000 // ₦620,000
    },
    {
      id: 'acc_access_1',
      bankName: 'Access Bank',
      accountName: 'Savings Account',
      accountType: 'savings',
      accountNumber: '•••• 1043',
      balanceMinor: 48000000 // ₦480,000
    },
    {
      id: 'acc_uba_1',
      bankName: 'UBA',
      accountName: 'Current Account',
      accountType: 'checking',
      accountNumber: '•••• 6672',
      balanceMinor: 32000000 // ₦320,000
    }
  ]);

  // Screen 14 has GTBank Current & Savings checked by default
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([
    'acc_gtb_1',
    'acc_gtb_2'
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAccount = (id: string) => {
    if (selectedAccountIds.includes(id)) {
      setSelectedAccountIds(selectedAccountIds.filter(x => x !== id));
    } else {
      setSelectedAccountIds([...selectedAccountIds, id]);
    }
  };

  const filteredProviders = PROVIDERS.filter(p => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectProvider = (provider: ProviderItem) => {
    setSelectedProvider(provider);
    setSubView('select');
  };

  const handleConfirmAccounts = async () => {
    setIsSubmitting(true);
    try {
      const accountsToAdd = discoveredAccounts.filter(a => selectedAccountIds.includes(a.id));
      for (const acc of accountsToAdd) {
        await apiV1.createAccount(workspaceId, {
          name: `${acc.bankName} ${acc.accountName}`,
          type: acc.accountType,
          accountNumber: acc.accountNumber,
          bankName: acc.bankName,
          openingBalanceMinor: acc.balanceMinor
        });
      }
      onContinue();
    } catch (err) {
      console.error('Error adding accounts:', err);
      onContinue();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNaira = (minor: number) => {
    return `₦${(minor / 100).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // =========================================================================
  // SCREEN 14: SELECT ACCOUNTS ("Choose accounts to add")
  // =========================================================================
  if (subView === 'select') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Choose accounts to add
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Select the accounts you want to connect to CashDeck.
          </p>
        </div>

        <div className="space-y-3">
          {discoveredAccounts.map(account => {
            const isChecked = selectedAccountIds.includes(account.id);
            return (
              <div
                key={account.id}
                onClick={() => toggleAccount(account.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                  isChecked
                    ? 'border-[#047857] bg-emerald-50/30 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <BankLogo bankName={account.bankName} size="md" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {account.bankName}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {account.accountName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {formatNaira(account.balanceMinor)}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      isChecked
                        ? 'bg-[#047857] border-[#047857] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom controls: Back on left, Add button on right */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setSubView('catalog')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting || selectedAccountIds.length === 0}
            onClick={handleConfirmAccounts}
            className="py-3 px-6 bg-[#047857] hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            {isSubmitting ? 'Adding...' : 'Add selected accounts'}
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 13: FINANCIAL PROVIDER CATALOG
  // =========================================================================
  if (subView === 'catalog') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Providers
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Connect your bank and financial accounts to get the most out of CashDeck.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search for a provider..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          {(['all', 'banks', 'cards', 'other'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setCategoryFilter(tab)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                categoryFilter === tab
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Provider Grid (2 columns or 3 columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredProviders.map(provider => (
            <div
              key={provider.id}
              onClick={() => handleSelectProvider(provider)}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs bg-white cursor-pointer transition-all flex items-center gap-3 group select-none"
            >
              <BankLogo bankName={provider.name} size="md" />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-800">
                  {provider.name}
                </h4>
                <span className="text-[10px] text-slate-400 capitalize block truncate">
                  {provider.subLabel || provider.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer Note */}
        <div className="pt-2 text-center">
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
            Can't find your provider? Provider availability depends on supported financial-data integrations.
          </p>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setSubView('landing')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 12: CONNECT FINANCIAL ACCOUNTS LANDING
  // =========================================================================
  return (
    <div className="space-y-6 text-center">
      {/* 3 Connected Nodes Illustration */}
      <div className="flex justify-center pt-2">
        <ConnectedAccountsIllustration size={230} />
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Bring your accounts into CashDeck
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          Connect your financial accounts so CashDeck can organize your transactions and give you a clearer picture of your money.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={() => setSubView('catalog')}
          className="w-full py-3.5 px-6 bg-[#047857] hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer"
        >
          Connect an account
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          I'll do this later
        </button>
      </div>

      <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>Your financial information is protected.</span>
      </div>
    </div>
  );
};

