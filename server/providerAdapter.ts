import { FinancialAccount, CanonicalTransaction } from './types';

export interface DiscoveredAccount {
  providerAccountId: string;
  bankName: string;
  accountName: string;
  type: 'bank' | 'wallet' | 'card';
  maskedAccountNumber: string;
  balance: number;
  availableBalance: number;
  currency: string;
}

export interface ProviderTransaction {
  providerTransactionId: string;
  amount: number;
  direction: 'inflow' | 'outflow';
  originalDescription: string;
  sender?: string;
  recipient?: string;
  merchant?: string;
  referenceId: string;
  channel: 'Bank Transfer' | 'POS Payment' | 'Web Checkout' | 'ATM Withdrawal' | 'Direct Debit';
  bankCategory?: string;
  date: string;
  time: string;
  status: 'Completed' | 'Pending';
}

export interface FinancialProviderAdapter {
  id: string;
  name: string;
  isMock: boolean;
  connectUser(userId: string, kycRef: string): Promise<{ customerId: string }>;
  discoverAccounts(customerId: string): Promise<DiscoveredAccount[]>;
  connectAccount(account: DiscoveredAccount): Promise<{ providerAccountId: string; initialSyncToken: string }>;
  getBalances(providerAccountId: string): Promise<{ balance: number; availableBalance: number; currency: string }>;
  getTransactions(providerAccountId: string, sinceDate?: string): Promise<ProviderTransaction[]>;
  refreshAccount(providerAccountId: string): Promise<{ balance: number; newTransactions: ProviderTransaction[] }>;
  disconnectAccount(providerAccountId: string): Promise<boolean>;
  verifyWebhookSignature(signature: string, rawBody: string): boolean;
  handleWebhook(payload: any): Promise<{ eventId: string; accountId?: string; transactions?: ProviderTransaction[] }>;
  getConnectionStatus(providerAccountId: string): Promise<'active' | 'needs_attention' | 'disconnected'>;
}

/**
 * Mock Financial Provider Adapter
 * Simulates genuine Nigerian Open Banking / Aggregator API feeds.
 * Pre-configured with realistic balances, masked accounts, and live transaction streams for:
 * GTBank, Access Bank, UBA, OPay, Zenith, FirstBank, Kuda, Moniepoint.
 */
export class MockFinancialProviderAdapter implements FinancialProviderAdapter {
  id = 'mock_open_banking_ng';
  name = 'Nigerian Open Banking Network (Dev Adapter)';
  isMock = true;

  // Stored state for simulated accounts
  private accountsState: Map<string, { balance: number; availableBalance: number; status: 'active' | 'needs_attention' | 'disconnected' }> = new Map();

  constructor() {
    this.accountsState.set('gtb_01', { balance: 2100000, availableBalance: 2100000, status: 'active' });
    this.accountsState.set('access_01', { balance: 850000, availableBalance: 850000, status: 'active' });
    this.accountsState.set('uba_01', { balance: 1400000, availableBalance: 1400000, status: 'active' });
    this.accountsState.set('opay_01', { balance: 500000, availableBalance: 500000, status: 'active' });
    this.accountsState.set('zenith_01', { balance: 1850000, availableBalance: 1850000, status: 'active' });
    this.accountsState.set('kuda_01', { balance: 320000, availableBalance: 320000, status: 'active' });
  }

  async connectUser(userId: string, kycRef: string): Promise<{ customerId: string }> {
    // Simulates customer registration in Open Banking registry
    return { customerId: `cust_ob_${kycRef.slice(-6)}` };
  }

  async discoverAccounts(customerId: string): Promise<DiscoveredAccount[]> {
    // Simulates accounts discovery from customer KYC linkage
    return [
      {
        providerAccountId: 'gtb_01',
        bankName: 'GTBank',
        accountName: 'GTBank Individual Current',
        type: 'bank',
        maskedAccountNumber: '•••• 4821',
        balance: 2100000,
        availableBalance: 2100000,
        currency: 'NGN'
      },
      {
        providerAccountId: 'access_01',
        bankName: 'Access Bank',
        accountName: 'Access Premier Checking',
        type: 'bank',
        maskedAccountNumber: '•••• 1934',
        balance: 850000,
        availableBalance: 850000,
        currency: 'NGN'
      },
      {
        providerAccountId: 'uba_01',
        bankName: 'UBA',
        accountName: 'UBA Lion Savings',
        type: 'bank',
        maskedAccountNumber: '•••• 7712',
        balance: 1400000,
        availableBalance: 1400000,
        currency: 'NGN'
      },
      {
        providerAccountId: 'opay_01',
        bankName: 'OPay',
        accountName: 'OPay Wallet Balance',
        type: 'wallet',
        maskedAccountNumber: '•••• 6291',
        balance: 500000,
        availableBalance: 500000,
        currency: 'NGN'
      }
    ];
  }

  async connectAccount(account: DiscoveredAccount): Promise<{ providerAccountId: string; initialSyncToken: string }> {
    this.accountsState.set(account.providerAccountId, {
      balance: account.balance,
      availableBalance: account.availableBalance,
      status: 'active'
    });
    return {
      providerAccountId: account.providerAccountId,
      initialSyncToken: `sync_tok_${Date.now()}`
    };
  }

  async getBalances(providerAccountId: string): Promise<{ balance: number; availableBalance: number; currency: string }> {
    const acc = this.accountsState.get(providerAccountId);
    return {
      balance: acc?.balance ?? 1000000,
      availableBalance: acc?.availableBalance ?? 1000000,
      currency: 'NGN'
    };
  }

  async getTransactions(providerAccountId: string, sinceDate?: string): Promise<ProviderTransaction[]> {
    // Returns authentic initial transactions for the specific bank
    switch (providerAccountId) {
      case 'gtb_01':
        return [
          {
            providerTransactionId: 'TRX_GTB_8392018',
            amount: 500000,
            direction: 'inflow',
            originalDescription: 'NIP/GTB/JOHN DOE/CONSULTING FEE/TRX8392018',
            sender: 'John Doe',
            referenceId: 'TRX8392018',
            channel: 'Bank Transfer',
            bankCategory: 'Direct Transfer',
            date: '2026-10-02',
            time: '10:42 AM',
            status: 'Completed'
          },
          {
            providerTransactionId: 'TRX_GTB_8391104',
            amount: -600000,
            direction: 'outflow',
            originalDescription: 'NIP/GTB/TECHWORLD SUPPLIES/INV0928/TRX8391104',
            recipient: 'TechWorld Supplies',
            referenceId: 'TRX8391104',
            channel: 'Bank Transfer',
            bankCategory: 'Vendor Payment',
            date: '2026-10-01',
            time: '11:32 AM',
            status: 'Completed'
          }
        ];

      case 'access_01':
        return [
          {
            providerTransactionId: 'TRX_ACC_9021844',
            amount: -45000,
            direction: 'outflow',
            originalDescription: 'FT/ACC/FUNKE ADELEKE/FAMILY SUPPORT/TRX9021844',
            recipient: 'Mrs. Funke Adeleke',
            referenceId: 'TRX9021844',
            channel: 'Bank Transfer',
            bankCategory: 'Personal Transfer',
            date: '2026-10-02',
            time: '08:15 AM',
            status: 'Completed'
          },
          {
            providerTransactionId: 'TRX_ACC_9018442',
            amount: 150000,
            direction: 'inflow',
            originalDescription: 'NIP/ACC/ACME GLOBAL/MONTHLY RETAINER/TRX9018442',
            sender: 'Acme Global NG',
            referenceId: 'TRX9018442',
            channel: 'Bank Transfer',
            bankCategory: 'Retainer Payout',
            date: '2026-10-01',
            time: '09:12 AM',
            status: 'Completed'
          }
        ];

      case 'uba_01':
        return [
          {
            providerTransactionId: 'TRX_UBA_7192081',
            amount: -12500,
            direction: 'outflow',
            originalDescription: 'POS/002910/SHOPRITE IKEJA MALL/LAGOS/TRX7192081',
            merchant: 'Shoprite Ikeja City Mall',
            referenceId: 'TRX7192081',
            channel: 'POS Payment',
            bankCategory: 'Groceries & Household',
            date: '2026-10-02',
            time: '01:20 PM',
            status: 'Completed'
          },
          {
            providerTransactionId: 'TRX_UBA_7190032',
            amount: 7200,
            direction: 'inflow',
            originalDescription: 'INT/CREDIT/UBA SAVINGS REWARD YIELD/TRX7190032',
            sender: 'United Bank for Africa',
            referenceId: 'TRX7190032',
            channel: 'Bank Transfer',
            bankCategory: 'Interest Reward',
            date: '2026-09-30',
            time: '04:15 PM',
            status: 'Completed'
          }
        ];

      case 'opay_01':
        return [
          {
            providerTransactionId: 'TRX_OPAY_4091823',
            amount: 100000,
            direction: 'inflow',
            originalDescription: 'OPAY/TRF/CHINEDU EZE/GADGET SETTLEMENT/TRX4091823',
            sender: 'Chinedu Eze',
            referenceId: 'TRX4091823',
            channel: 'Bank Transfer',
            bankCategory: 'Wallet Transfer',
            date: '2026-10-02',
            time: '03:40 PM',
            status: 'Completed'
          },
          {
            providerTransactionId: 'TRX_OPAY_4090012',
            amount: -8500,
            direction: 'outflow',
            originalDescription: 'OPAY/MERCHANT/FOODIES DELIGHT/TRX4090012',
            merchant: 'Foodies Delight Lagos',
            referenceId: 'TRX4090012',
            channel: 'Web Checkout',
            bankCategory: 'Food Delivery',
            date: '2026-10-01',
            time: '07:22 PM',
            status: 'Completed'
          }
        ];

      default:
        return [];
    }
  }

  async refreshAccount(providerAccountId: string): Promise<{ balance: number; newTransactions: ProviderTransaction[] }> {
    const acc = this.accountsState.get(providerAccountId);
    const currentBalance = acc?.balance ?? 1000000;
    // In mock mode, check if there's any dynamic webhook transaction that was added
    return {
      balance: currentBalance,
      newTransactions: []
    };
  }

  async disconnectAccount(providerAccountId: string): Promise<boolean> {
    const acc = this.accountsState.get(providerAccountId);
    if (acc) {
      acc.status = 'disconnected';
      this.accountsState.set(providerAccountId, acc);
    }
    return true;
  }

  verifyWebhookSignature(signature: string, rawBody: string): boolean {
    // In dev mode, verify non-empty signature; in prod HMAC SHA256
    return !!signature;
  }

  async handleWebhook(payload: any): Promise<{ eventId: string; accountId?: string; transactions?: ProviderTransaction[] }> {
    const eventId = payload.eventId || `evt_${Date.now()}`;
    const accountId = payload.accountId || 'gtb_01';

    let transactions: ProviderTransaction[] = [];
    if (payload.transaction) {
      transactions.push(payload.transaction);
      // Adjust balance in mock state
      const acc = this.accountsState.get(accountId);
      if (acc) {
        acc.balance += payload.transaction.amount;
        acc.availableBalance += payload.transaction.amount;
        this.accountsState.set(accountId, acc);
      }
    }

    return {
      eventId,
      accountId,
      transactions
    };
  }

  async getConnectionStatus(providerAccountId: string): Promise<'active' | 'needs_attention' | 'disconnected'> {
    return this.accountsState.get(providerAccountId)?.status ?? 'active';
  }

  setAccountStatus(providerAccountId: string, status: 'active' | 'needs_attention' | 'disconnected') {
    const acc = this.accountsState.get(providerAccountId);
    if (acc) {
      acc.status = status;
      this.accountsState.set(providerAccountId, acc);
    }
  }
}
