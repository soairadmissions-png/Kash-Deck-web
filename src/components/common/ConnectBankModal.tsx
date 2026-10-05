import React, { useState } from 'react';
import {
  X,
  Search,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Loader2,
  ChevronRight,
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { BankLogo } from './BankLogo';
import { AccountType, TransactionType } from '../../types';

interface ConnectBankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BankOption {
  id: string;
  name: string;
  code: string;
  category: 'Bank' | 'Fintech / Wallet' | 'Microfinance';
  color: string;
  tagline: string;
  suggestedAccounts: Array<{
    name: string;
    type: AccountType;
    maskedNum: string;
    balance: number;
    transactions: Array<{
      date: string;
      time: string;
      description: string;
      amount: number;
      category: string;
      type: TransactionType;
      referenceId: string;
      channel: 'Bank Transfer' | 'POS Payment' | 'Web Checkout' | 'ATM Withdrawal';
      rawDescription: string;
    }>;
  }>;
}

const NIGERIAN_PROVIDERS: BankOption[] = [
  {
    id: 'gtbank',
    name: 'GTBank',
    code: '058',
    category: 'Bank',
    color: '#e03a00',
    tagline: 'Guaranty Trust Bank Plc',
    suggestedAccounts: [
      {
        name: 'GTBank Current Account',
        type: 'bank',
        maskedNum: '•••• 4821',
        balance: 2100000,
        transactions: [
          {
            date: '2026-10-02',
            time: '10:42 AM',
            description: 'Transfer received',
            amount: 500000,
            category: 'Transfer',
            type: 'income',
            referenceId: 'TRX8392018',
            channel: 'Bank Transfer',
            rawDescription: 'NIP/GTB/JOHN DOE/BUSINESS PAYMENT/TRX8392018'
          },
          {
            date: '2026-10-01',
            time: '11:32 AM',
            description: 'TechWorld (Inventory Purchase)',
            amount: -600000,
            category: 'Business',
            type: 'expense',
            referenceId: 'TRX8391104',
            channel: 'Bank Transfer',
            rawDescription: 'NIP/GTB/TECHWORLD SUPPLIES/INV0928'
          }
        ]
      }
    ]
  },
  {
    id: 'access',
    name: 'Access Bank',
    code: '044',
    category: 'Bank',
    color: '#005baa',
    tagline: 'Access Bank Plc',
    suggestedAccounts: [
      {
        name: 'Access Premier Checking',
        type: 'bank',
        maskedNum: '•••• 1934',
        balance: 850000,
        transactions: [
          {
            date: '2026-10-02',
            time: '08:15 AM',
            description: 'Transfer to Mrs. Funke Adeleke',
            amount: -45000,
            category: 'Transfer',
            type: 'expense',
            referenceId: 'TRX9021844',
            channel: 'Bank Transfer',
            rawDescription: 'FT/ACC/FUNKE ADELEKE/FAMILY SUPPORT/TRX9021844'
          },
          {
            date: '2026-10-01',
            time: '09:12 AM',
            description: 'Client Advisory Retainer',
            amount: 150000,
            category: 'Income',
            type: 'income',
            referenceId: 'TRX9018442',
            channel: 'Bank Transfer',
            rawDescription: 'NIP/ACC/ACME GLOBAL/MONTHLY RETAINER'
          }
        ]
      }
    ]
  },
  {
    id: 'uba',
    name: 'UBA',
    code: '033',
    category: 'Bank',
    color: '#dc2626',
    tagline: 'United Bank for Africa',
    suggestedAccounts: [
      {
        name: 'UBA Lion Savings Account',
        type: 'bank',
        maskedNum: '•••• 7712',
        balance: 1400000,
        transactions: [
          {
            date: '2026-10-02',
            time: '01:20 PM',
            description: 'POS Payment - Shoprite Ikeja',
            amount: -12500,
            category: 'Groceries',
            type: 'expense',
            referenceId: 'TRX7192081',
            channel: 'POS Payment',
            rawDescription: 'POS/002910/SHOPRITE IKEJA MALL/LAGOS'
          },
          {
            date: '2026-09-30',
            time: '04:15 PM',
            description: 'Monthly Savings Interest',
            amount: 7200,
            category: 'Income',
            type: 'income',
            referenceId: 'TRX7190032',
            channel: 'Bank Transfer',
            rawDescription: 'INT/CREDIT/UBA SAVINGS REWARD'
          }
        ]
      }
    ]
  },
  {
    id: 'opay',
    name: 'OPay',
    code: '999992',
    category: 'Fintech / Wallet',
    color: '#059669',
    tagline: 'OPay Digital Services',
    suggestedAccounts: [
      {
        name: 'OPay Wallet Balance',
        type: 'wallet',
        maskedNum: '•••• 6291',
        balance: 500000,
        transactions: [
          {
            date: '2026-10-02',
            time: '03:40 PM',
            description: 'Transfer received from Chinedu Eze',
            amount: 100000,
            category: 'Receivable',
            type: 'income',
            referenceId: 'TRX4091823',
            channel: 'Bank Transfer',
            rawDescription: 'OPAY/TRF/CHINEDU EZE/GADGET SETTLEMENT'
          },
          {
            date: '2026-10-01',
            time: '07:22 PM',
            description: 'Fast Food Delivery',
            amount: -8500,
            category: 'Food & Dining',
            type: 'expense',
            referenceId: 'TRX4090012',
            channel: 'Web Checkout',
            rawDescription: 'OPAY/MERCHANT/FOODIES DELIGHT'
          }
        ]
      }
    ]
  },
  {
    id: 'zenith',
    name: 'Zenith Bank',
    code: '057',
    category: 'Bank',
    color: '#991b1b',
    tagline: 'Zenith Bank Plc',
    suggestedAccounts: [
      {
        name: 'Zenith Premium Account',
        type: 'bank',
        maskedNum: '•••• 3819',
        balance: 1850000,
        transactions: [
          {
            date: '2026-10-02',
            time: '11:15 AM',
            description: 'Consulting Honorarium',
            amount: 250000,
            category: 'Income',
            type: 'income',
            referenceId: 'TRX6210982',
            channel: 'Bank Transfer',
            rawDescription: 'NIP/ZEN/TECHVENTURES/OCT HONORARIUM'
          },
          {
            date: '2026-10-01',
            time: '04:45 PM',
            description: 'Utility & Fuel Expense',
            amount: -35000,
            category: 'Transport',
            type: 'expense',
            referenceId: 'TRX6209811',
            channel: 'POS Payment',
            rawDescription: 'POS/ZEN/TOTALENERGIES VI/LAGOS'
          }
        ]
      }
    ]
  },
  {
    id: 'kuda',
    name: 'Kuda Bank',
    code: '090267',
    category: 'Fintech / Wallet',
    color: '#40196d',
    tagline: 'The Bank of the Free',
    suggestedAccounts: [
      {
        name: 'Kuda Spend Account',
        type: 'bank',
        maskedNum: '•••• 8910',
        balance: 320000,
        transactions: [
          {
            date: '2026-10-02',
            time: '09:05 AM',
            description: 'Freelance Design Payment',
            amount: 80000,
            category: 'Income',
            type: 'income',
            referenceId: 'TRX3910283',
            channel: 'Bank Transfer',
            rawDescription: 'KUDA/NIP/DESIGN WORK/TRX3910283'
          },
          {
            date: '2026-10-01',
            time: '06:14 PM',
            description: 'Streaming & Internet Data',
            amount: -15000,
            category: 'Personal',
            type: 'expense',
            referenceId: 'TRX3908819',
            channel: 'Web Checkout',
            rawDescription: 'KUDA/CARD/NETFLIX & DATA'
          }
        ]
      }
    ]
  },
  {
    id: 'moniepoint',
    name: 'Moniepoint',
    code: '50515',
    category: 'Fintech / Wallet',
    color: '#003399',
    tagline: 'Moniepoint MFB',
    suggestedAccounts: [
      {
        name: 'Moniepoint Business Reserve',
        type: 'bank',
        maskedNum: '•••• 5521',
        balance: 950000,
        transactions: [
          {
            date: '2026-10-02',
            time: '02:30 PM',
            description: 'Merchant POS Settlement',
            amount: 320000,
            category: 'Income',
            type: 'income',
            referenceId: 'TRX5502911',
            channel: 'POS Payment',
            rawDescription: 'MP/SETTLE/TERMINAL#8812/POS SETTLEMENT'
          },
          {
            date: '2026-10-01',
            time: '12:10 PM',
            description: 'Store Logistics Payment',
            amount: -18000,
            category: 'Business',
            type: 'expense',
            referenceId: 'TRX5501822',
            channel: 'Bank Transfer',
            rawDescription: 'MP/TRF/GIG LOGISTICS/DISPATCH'
          }
        ]
      }
    ]
  },
  {
    id: 'firstbank',
    name: 'First Bank of Nigeria',
    code: '011',
    category: 'Bank',
    color: '#0b2341',
    tagline: 'Since 1894',
    suggestedAccounts: [
      {
        name: 'FirstBank Classic Savings',
        type: 'bank',
        maskedNum: '•••• 6401',
        balance: 1100000,
        transactions: [
          {
            date: '2026-10-02',
            time: '12:00 PM',
            description: 'Dividend Payout Received',
            amount: 75000,
            category: 'Income',
            type: 'income',
            referenceId: 'TRX1109281',
            channel: 'Bank Transfer',
            rawDescription: 'FBN/NIP/FIRST REGISTRARS/DIVIDEND'
          }
        ]
      }
    ]
  }
];

export const ConnectBankModal: React.FC<ConnectBankModalProps> = ({ isOpen, onClose }) => {
  const { connectFullProvider, accounts } = useFinancial();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<BankOption | null>(null);
  const [step, setStep] = useState<'select' | 'connecting' | 'review' | 'success'>('select');
  const [selectedAccountIndices, setSelectedAccountIndices] = useState<{ [key: number]: boolean }>({ 0: true });

  if (!isOpen) return null;

  const connectedBankNames = accounts.map(a => a.bankName.toLowerCase());

  const filteredBanks = NIGERIAN_PROVIDERS.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectBank = (bank: BankOption) => {
    setSelectedBank(bank);
    setSelectedAccountIndices({ 0: true });
    setStep('connecting');

    // Simulate direct bank-grade API handshake
    setTimeout(() => {
      setStep('review');
    }, 1400);
  };

  const handleConfirmSync = () => {
    if (!selectedBank) return;

    // Connect selected accounts automatically
    selectedBank.suggestedAccounts.forEach((acc, idx) => {
      if (selectedAccountIndices[idx] !== false) {
        connectFullProvider(
          selectedBank.name,
          acc.name,
          acc.maskedNum,
          acc.balance,
          acc.type,
          acc.transactions
        );
      }
    });

    setStep('success');
    setTimeout(() => {
      setStep('select');
      setSelectedBank(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            {step === 'review' && (
              <button
                onClick={() => setStep('select')}
                className="w-7 h-7 rounded-lg hover:bg-slate-200/60 flex items-center justify-center text-slate-500 mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Direct Financial Integration
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {step === 'select' && 'Connect Financial Account'}
                {step === 'connecting' && `Connecting to ${selectedBank?.name}...`}
                {step === 'review' && 'Automatic Account Discovery'}
                {step === 'success' && 'Account Connected Successfully!'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* STEP 1: SELECT BANK */}
          {step === 'select' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    No manual data entry required
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                    Connect your financial institution once. CashDeck automatically retrieves your real balances, account names, and chronological transactions.
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search Nigerian bank or mobile wallet..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all shadow-xs"
                />
              </div>

              {/* Banks List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredBanks.map(bank => {
                  const isAlreadyConnected = connectedBankNames.includes(bank.name.toLowerCase());
                  return (
                    <div
                      key={bank.id}
                      onClick={() => handleSelectBank(bank)}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-150 hover:border-emerald-500/40 hover:bg-emerald-50/30 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <BankLogo bankName={bank.name} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                              {bank.name}
                            </h4>
                            {isAlreadyConnected && (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                                Linked
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">{bank.tagline}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md">
                          {bank.category}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CONNECTING / SECURE HANDSHAKE ANIMATION */}
          {step === 'connecting' && selectedBank && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <BankLogo bankName={selectedBank.name} size="lg" className="ring-4 ring-emerald-100" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Establishing Direct Connection
                </h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Connecting securely to {selectedBank.name} Open Banking gateway with 256-bit encryption...
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                <Lock className="w-3 h-3" />
                <span>Zero balance entry • Instant automatic sync</span>
              </div>
            </div>
          )}

          {/* STEP 3: AUTOMATIC ACCOUNT DISCOVERY & TRANSACTIONS PREVIEW */}
          {step === 'review' && selectedBank && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-150">
                <BankLogo bankName={selectedBank.name} size="md" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {selectedBank.name} Verified
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Discovered active account(s) and transaction ledger
                  </p>
                </div>
              </div>

              {/* Discovered Accounts */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Accounts Retrieved
                </label>
                {selectedBank.suggestedAccounts.map((acc, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      setSelectedAccountIndices(prev => ({
                        ...prev,
                        [idx]: !prev[idx]
                      }))
                    }
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedAccountIndices[idx] !== false
                        ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600/30'
                        : 'border-slate-200 bg-white opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          selectedAccountIndices[idx] !== false
                            ? 'bg-emerald-700 text-white'
                            : 'border border-slate-300'
                        }`}
                      >
                        {selectedAccountIndices[idx] !== false && (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{acc.name}</h5>
                        <p className="text-[11px] text-slate-400">
                          {acc.maskedNum} • Checking / Liquid
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900 block">
                        ₦{acc.balance.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Available Balance
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Transactions Automatically Fetched Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Latest Bank Transactions Automatically Synced
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Direct Bank Feed
                  </span>
                </div>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-150 text-xs">
                  {selectedBank.suggestedAccounts[0]?.transactions.slice(0, 3).map((tx, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-slate-200/50 last:border-none">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                            tx.amount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {tx.amount > 0 ? (
                            <ArrowDownLeft className="w-3 h-3 text-emerald-700" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-slate-700" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-[11px] truncate max-w-[200px]">
                            {tx.description}
                          </p>
                          <span className="text-[10px] text-slate-400">{tx.referenceId}</span>
                        </div>
                      </div>
                      <span
                        className={`font-bold text-[11px] ${
                          tx.amount > 0 ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {tx.amount > 0 ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmSync}
                className="w-full py-3 bg-[#047857] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Connect & View My Money</span>
              </button>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'success' && selectedBank && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {selectedBank.name} Connected!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Your balances and transactions are now live in your CashDeck dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
