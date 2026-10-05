import { Account, Transaction } from '../types';

export interface DiscoveredAccountDTO {
  providerAccountId: string;
  bankName: string;
  accountName: string;
  type: 'bank' | 'wallet' | 'card';
  maskedAccountNumber: string;
  balance: number;
  availableBalance: number;
  currency: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

class CashDeckApiClient {
  private getHeaders(): HeadersInit {
    const userId = localStorage.getItem('cashdeck_current_user_id') || 'usr_cd_489201';
    return {
      'Content-Type': 'application/json',
      'X-User-Id': userId
    };
  }

  // --- AUTH ---
  async register(name: string, emailOrPhone: string): Promise<any> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, emailOrPhone })
    });
    const data = await res.json();
    if (data.user?.id) {
      localStorage.setItem('cashdeck_current_user_id', data.user.id);
    }
    return data;
  }

  async getMe(): Promise<any> {
    const res = await fetch('/api/auth/me', {
      headers: this.getHeaders()
    });
    return res.json();
  }

  // --- IDENTITY & KYC ---
  async verifyIdentity(idType: 'NIN' | 'BVN', idNumber: string): Promise<any> {
    const res = await fetch('/api/identity/verify', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ idType, idNumber })
    });
    return res.json();
  }

  // --- CONSENT ---
  async grantConsent(scopes: ('account_info' | 'balances' | 'transactions')[]): Promise<any> {
    const res = await fetch('/api/consent', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ scopes })
    });
    return res.json();
  }

  async getConsent(): Promise<any> {
    const res = await fetch('/api/consent', {
      headers: this.getHeaders()
    });
    return res.json();
  }

  async revokeConsent(): Promise<any> {
    const res = await fetch('/api/consent/revoke', {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  // --- FINANCIAL DISCOVERY & CONNECTION ---
  async discoverAccounts(): Promise<{ provider: string; isMock: boolean; discoveredAccounts: DiscoveredAccountDTO[] }> {
    const res = await fetch('/api/financial/discover', {
      headers: this.getHeaders()
    });
    return res.json();
  }

  async connectAccounts(accountsToConnect: DiscoveredAccountDTO[]): Promise<any> {
    const res = await fetch('/api/financial/connect', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ accountsToConnect })
    });
    return res.json();
  }

  async getAccounts(): Promise<{ accounts: Account[]; currencyTotals: Record<string, number>; totalBalanceNGN: number }> {
    const res = await fetch('/api/financial/accounts', {
      headers: this.getHeaders()
    });
    return res.json();
  }

  async refreshAccount(id: string = 'all'): Promise<any> {
    const res = await fetch(`/api/financial/accounts/${id}/refresh`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  async reconnectAccount(id: string): Promise<any> {
    const res = await fetch(`/api/financial/accounts/${id}/reconnect`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  async disconnectAccount(id: string): Promise<any> {
    const res = await fetch(`/api/financial/accounts/${id}/disconnect`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  // --- TRANSACTIONS ---
  async getTransactions(filters?: { accountId?: string; direction?: string; category?: string; search?: string }): Promise<{ transactions: Transaction[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.accountId) params.set('accountId', filters.accountId);
    if (filters?.direction) params.set('direction', filters.direction);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.search) params.set('search', filters.search);

    const res = await fetch(`/api/transactions?${params.toString()}`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  async updateTransactionMetadata(id: string, updates: { category?: string; classification?: 'Personal' | 'Business' | 'Transfer' | 'Unknown'; notes?: string }): Promise<any> {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  }

  async addCashTransaction(description: string, amount: number, category: string, classification: 'Personal' | 'Business'): Promise<any> {
    const res = await fetch('/api/transactions/cash', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ description, amount, category, classification })
    });
    return res.json();
  }

  // --- DEV & SIMULATION HELPERS ---
  async simulateWebhook(accountId: string, amount: number, description: string): Promise<any> {
    const res = await fetch('/api/dev/simulate-webhook', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ accountId, amount, description })
    });
    return res.json();
  }

  async simulateAttention(accountId?: string): Promise<any> {
    const res = await fetch('/api/dev/simulate-attention', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ accountId })
    });
    return res.json();
  }

  async resetData(): Promise<any> {
    const res = await fetch('/api/dev/reset', {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  async getDevStatus(): Promise<any> {
    const res = await fetch('/api/dev/status', {
      headers: this.getHeaders()
    });
    return res.json();
  }
}

export const api = new CashDeckApiClient();
