export type AccountType = 'bank' | 'cash' | 'card' | 'wallet' | 'investment' | 'business';

export interface User {
  id: string; // e.g. usr_cd_938102
  name: string;
  emailOrPhone: string;
  createdAt: string;
}

export interface IdentityVerification {
  userId: string;
  idType: 'NIN' | 'BVN';
  maskedId: string; // e.g. •••••••1842 - NEVER store or expose full NIN!
  kycProviderRef: string;
  status: 'verified' | 'pending' | 'failed';
  verifiedAt: string;
}

export interface Consent {
  id: string;
  userId: string;
  scopes: ('account_info' | 'balances' | 'transactions')[];
  status: 'active' | 'revoked';
  grantedAt: string;
  revokedAt?: string;
  ipAddress?: string;
}

export interface FinancialInstitution {
  id: string;
  name: string;
  code: string;
  logo: string;
  category: 'Commercial Bank' | 'Digital Bank' | 'Payment Service Bank';
}

export interface FinancialAccount {
  id: string;
  userId: string;
  providerId: string;
  providerAccountId: string;
  bankName: string;
  name: string;
  type: AccountType;
  accountNumber?: string;
  maskedAccountNumber: string;
  balance: number;
  availableBalance: number;
  currency: string;
  isBusiness: boolean;
  status: 'active' | 'syncing' | 'needs_attention' | 'disconnected';
  lastSyncedAt: string;
  errorMessage?: string;
}

export type TransactionDirection = 'inflow' | 'outflow';
export type TransactionClassification = 'Personal' | 'Business' | 'Transfer' | 'Unknown';

export interface CanonicalTransaction {
  id: string;
  providerId: string;
  providerTransactionId: string; // Unique deduplication key: providerId + providerTransactionId
  accountId: string;
  userId: string;
  date: string;
  time: string;
  amount: number; // positive for inflow, negative for outflow
  currency: string;
  direction: TransactionDirection;
  // Bank Data (Immutable from provider)
  originalDescription: string;
  merchant?: string;
  sender?: string;
  recipient?: string;
  referenceId: string;
  channel: 'Bank Transfer' | 'POS Payment' | 'Web Checkout' | 'ATM Withdrawal' | 'Direct Debit' | 'Cash';
  bankCategory?: string;
  // CashDeck Data (User adjustable)
  category: string;
  classification: TransactionClassification;
  notes?: string;
  isCashEntry: boolean;
  isBusiness: boolean;
  status: 'Completed' | 'Pending' | 'Needs review' | 'Reversed';
  createdAt: string;
}

export interface SyncRun {
  id: string;
  accountId: string;
  startedAt: string;
  completedAt?: string;
  status: 'success' | 'failed' | 'in_progress';
  transactionsAdded: number;
  transactionsUpdated: number;
  errorMessage?: string;
}

export interface WebhookEvent {
  id: string;
  eventId: string;
  provider: string;
  eventType: string;
  signature: string;
  payload: any;
  processedAt: string;
  status: 'processed' | 'duplicate_ignored' | 'failed';
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}
