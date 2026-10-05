import {
  User,
  IdentityVerification,
  Consent,
  FinancialAccount,
  CanonicalTransaction,
  SyncRun,
  WebhookEvent,
  AuditLog
} from './types';

/**
 * In-Memory Canonical Relational Database Layer
 * Enforces:
 * - Mandatory transaction deduplication via (providerId + providerTransactionId)
 * - Mandatory webhook deduplication via (eventId)
 * - Audit logging
 * - Distinction between Bank Data (immutable) and CashDeck Data (user categorized/classified)
 */
class FinancialDatabase {
  private users: Map<string, User> = new Map();
  private identityVerifications: Map<string, IdentityVerification> = new Map();
  private consents: Map<string, Consent> = new Map();
  private accounts: Map<string, FinancialAccount> = new Map();
  private transactions: Map<string, CanonicalTransaction> = new Map();
  // Unique composite index for deduplication: `${providerId}:${providerTransactionId}` => transactionId
  private txUniqueIndex: Map<string, string> = new Map();
  // Webhook event deduplication
  private processedWebhookEvents: Map<string, WebhookEvent> = new Map();
  private syncRuns: SyncRun[] = [];
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.seedDefaultUser();
  }

  // --- SEED INITIAL USER FOR DEMO & TESTING ---
  seedDefaultUser() {
    const defaultUserId = 'usr_cd_489201';
    const defaultUser: User = {
      id: defaultUserId,
      name: 'Ada Lovelace',
      emailOrPhone: 'ada@example.com',
      createdAt: '2026-09-01T08:00:00Z'
    };
    this.users.set(defaultUserId, defaultUser);

    this.identityVerifications.set(defaultUserId, {
      userId: defaultUserId,
      idType: 'NIN',
      maskedId: '•••••••1842',
      kycProviderRef: 'kyc_prov_998124',
      status: 'verified',
      verifiedAt: '2026-09-01T08:05:00Z'
    });

    this.consents.set(defaultUserId, {
      id: 'cns_01',
      userId: defaultUserId,
      scopes: ['account_info', 'balances', 'transactions'],
      status: 'active',
      grantedAt: '2026-09-01T08:06:00Z',
      ipAddress: '197.210.226.11'
    });

    // Seed 4 initial connected accounts totaling ₦4,850,000
    const seedAccounts: FinancialAccount[] = [
      {
        id: 'acc_gtb_01',
        userId: defaultUserId,
        providerId: 'mock_open_banking_ng',
        providerAccountId: 'gtb_01',
        bankName: 'GTBank',
        name: 'GTBank Individual Current',
        type: 'bank',
        accountNumber: '0123454821',
        maskedAccountNumber: '•••• 4821',
        balance: 2100000,
        availableBalance: 2100000,
        currency: 'NGN',
        isBusiness: false,
        status: 'active',
        lastSyncedAt: new Date().toISOString()
      },
      {
        id: 'acc_access_01',
        userId: defaultUserId,
        providerId: 'mock_open_banking_ng',
        providerAccountId: 'access_01',
        bankName: 'Access Bank',
        name: 'Access Premier Checking',
        type: 'bank',
        accountNumber: '0459821934',
        maskedAccountNumber: '•••• 1934',
        balance: 850000,
        availableBalance: 850000,
        currency: 'NGN',
        isBusiness: false,
        status: 'active',
        lastSyncedAt: new Date().toISOString()
      },
      {
        id: 'acc_uba_01',
        userId: defaultUserId,
        providerId: 'mock_open_banking_ng',
        providerAccountId: 'uba_01',
        bankName: 'UBA',
        name: 'UBA Lion Savings',
        type: 'bank',
        accountNumber: '1098237712',
        maskedAccountNumber: '•••• 7712',
        balance: 1400000,
        availableBalance: 1400000,
        currency: 'NGN',
        isBusiness: false,
        status: 'active',
        lastSyncedAt: new Date().toISOString()
      },
      {
        id: 'acc_opay_01',
        userId: defaultUserId,
        providerId: 'mock_open_banking_ng',
        providerAccountId: 'opay_01',
        bankName: 'OPay',
        name: 'OPay Wallet Balance',
        type: 'wallet',
        accountNumber: '8012346291',
        maskedAccountNumber: '•••• 6291',
        balance: 500000,
        availableBalance: 500000,
        currency: 'NGN',
        isBusiness: false,
        status: 'active',
        lastSyncedAt: new Date().toISOString()
      }
    ];

    seedAccounts.forEach(acc => this.accounts.set(acc.id, acc));

    // Seed canonical transactions with explicit deduplication keys
    const seedTransactions: Omit<CanonicalTransaction, 'id' | 'createdAt'>[] = [
      {
        providerId: 'mock_open_banking_ng',
        providerTransactionId: 'TRX_GTB_8392018',
        accountId: 'acc_gtb_01',
        userId: defaultUserId,
        date: '2026-10-02',
        time: '10:42 AM',
        amount: 500000,
        currency: 'NGN',
        direction: 'inflow',
        originalDescription: 'NIP/GTB/JOHN DOE/CONSULTING FEE/TRX8392018',
        sender: 'John Doe',
        referenceId: 'TRX8392018',
        channel: 'Bank Transfer',
        bankCategory: 'Direct Transfer',
        category: 'Transfer',
        classification: 'Business',
        notes: 'Consulting milestone payment for Q4 platform rollout',
        isCashEntry: false,
        isBusiness: true,
        status: 'Completed'
      },
      {
        providerId: 'mock_open_banking_ng',
        providerTransactionId: 'TRX_ACC_9021844',
        accountId: 'acc_access_01',
        userId: defaultUserId,
        date: '2026-10-02',
        time: '08:15 AM',
        amount: -45000,
        currency: 'NGN',
        direction: 'outflow',
        originalDescription: 'FT/ACC/FUNKE ADELEKE/FAMILY SUPPORT/TRX9021844',
        recipient: 'Mrs. Funke Adeleke',
        referenceId: 'TRX9021844',
        channel: 'Bank Transfer',
        bankCategory: 'Personal Transfer',
        category: 'Transfer',
        classification: 'Personal',
        notes: 'Family upkeep allowance',
        isCashEntry: false,
        isBusiness: false,
        status: 'Completed'
      },
      {
        providerId: 'mock_open_banking_ng',
        providerTransactionId: 'TRX_UBA_7192081',
        accountId: 'acc_uba_01',
        userId: defaultUserId,
        date: '2026-10-02',
        time: '01:20 PM',
        amount: -12500,
        currency: 'NGN',
        direction: 'outflow',
        originalDescription: 'POS/002910/SHOPRITE IKEJA MALL/LAGOS/TRX7192081',
        merchant: 'Shoprite Ikeja City Mall',
        referenceId: 'TRX7192081',
        channel: 'POS Payment',
        bankCategory: 'Groceries & Household',
        category: 'Groceries',
        classification: 'Personal',
        notes: 'Fresh groceries & pantry supplies',
        isCashEntry: false,
        isBusiness: false,
        status: 'Completed'
      },
      {
        providerId: 'mock_open_banking_ng',
        providerTransactionId: 'TRX_OPAY_4091823',
        accountId: 'acc_opay_01',
        userId: defaultUserId,
        date: '2026-10-02',
        time: '03:40 PM',
        amount: 100000,
        currency: 'NGN',
        direction: 'inflow',
        originalDescription: 'OPAY/TRF/CHINEDU EZE/GADGET SETTLEMENT/TRX4091823',
        sender: 'Chinedu Eze',
        referenceId: 'TRX4091823',
        channel: 'Bank Transfer',
        bankCategory: 'Wallet Transfer',
        category: 'Receivable',
        classification: 'Business',
        notes: 'Balance settlement for headphone units',
        isCashEntry: false,
        isBusiness: true,
        status: 'Completed'
      },
      {
        providerId: 'mock_open_banking_ng',
        providerTransactionId: 'TRX_ACC_9018442',
        accountId: 'acc_access_01',
        userId: defaultUserId,
        date: '2026-10-01',
        time: '09:12 AM',
        amount: 150000,
        currency: 'NGN',
        direction: 'inflow',
        originalDescription: 'NIP/ACC/ACME GLOBAL/MONTHLY RETAINER/TRX9018442',
        sender: 'Acme Global NG',
        referenceId: 'TRX9018442',
        channel: 'Bank Transfer',
        bankCategory: 'Retainer Payout',
        category: 'Income',
        classification: 'Personal',
        notes: 'Monthly advisory retainer',
        isCashEntry: false,
        isBusiness: false,
        status: 'Completed'
      },
      {
        providerId: 'mock_open_banking_ng',
        providerTransactionId: 'TRX_GTB_8391104',
        accountId: 'acc_gtb_01',
        userId: defaultUserId,
        date: '2026-10-01',
        time: '11:32 AM',
        amount: -600000,
        currency: 'NGN',
        direction: 'outflow',
        originalDescription: 'NIP/GTB/TECHWORLD SUPPLIES/INV0928/TRX8391104',
        recipient: 'TechWorld Supplies',
        referenceId: 'TRX8391104',
        channel: 'Bank Transfer',
        bankCategory: 'Vendor Payment',
        category: 'Business',
        classification: 'Business',
        notes: 'AirPods Pro wholesale inventory order',
        isCashEntry: false,
        isBusiness: true,
        status: 'Completed'
      }
    ];

    seedTransactions.forEach(stx => {
      this.upsertTransaction(stx);
    });
  }

  // --- USER & AUTH ---
  createUser(name: string, emailOrPhone: string): User {
    const id = `usr_cd_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const user: User = {
      id,
      name,
      emailOrPhone,
      createdAt: new Date().toISOString()
    };
    this.users.set(id, user);
    this.logAudit(id, 'USER_REGISTERED', `User registered with ${emailOrPhone}`);
    return user;
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  findUserByEmail(email: string): User | undefined {
    for (const u of this.users.values()) {
      if (u.emailOrPhone.toLowerCase() === email.toLowerCase()) return u;
    }
    return undefined;
  }

  getDefaultUserId(): string {
    return this.users.keys().next().value || 'usr_cd_489201';
  }

  // --- IDENTITY & KYC ---
  verifyIdentity(userId: string, idType: 'NIN' | 'BVN', rawIdNumber: string): IdentityVerification {
    // SECURITY: Never store full NIN/BVN in database or logs! Only store masked identifier.
    const cleanId = rawIdNumber.replace(/[^\d]/g, '');
    const last4 = cleanId.slice(-4) || '1842';
    const maskedId = `•••••••${last4}`;
    const kycProviderRef = `kyc_verif_${Date.now()}`;

    const record: IdentityVerification = {
      userId,
      idType,
      maskedId,
      kycProviderRef,
      status: 'verified',
      verifiedAt: new Date().toISOString()
    };

    this.identityVerifications.set(userId, record);
    this.logAudit(userId, 'IDENTITY_VERIFIED', `Identity verified with ${idType} ${maskedId}`);
    return record;
  }

  getIdentity(userId: string): IdentityVerification | undefined {
    return this.identityVerifications.get(userId);
  }

  // --- CONSENT ---
  grantConsent(userId: string, scopes: ('account_info' | 'balances' | 'transactions')[], ipAddress?: string): Consent {
    const consent: Consent = {
      id: `cns_${Date.now()}`,
      userId,
      scopes,
      status: 'active',
      grantedAt: new Date().toISOString(),
      ipAddress
    };
    this.consents.set(userId, consent);
    this.logAudit(userId, 'CONSENT_GRANTED', `Consent granted for scopes: ${scopes.join(', ')}`);
    return consent;
  }

  getConsent(userId: string): Consent | undefined {
    return this.consents.get(userId);
  }

  revokeConsent(userId: string): boolean {
    const consent = this.consents.get(userId);
    if (consent) {
      consent.status = 'revoked';
      consent.revokedAt = new Date().toISOString();
      this.consents.set(userId, consent);
      this.logAudit(userId, 'CONSENT_REVOKED', 'Financial access consent revoked by user');
      return true;
    }
    return false;
  }

  // --- ACCOUNTS ---
  getAccounts(userId: string): FinancialAccount[] {
    return Array.from(this.accounts.values()).filter(a => a.userId === userId && a.status !== 'disconnected');
  }

  getAccount(id: string): FinancialAccount | undefined {
    return this.accounts.get(id);
  }

  addOrUpdateAccount(acc: FinancialAccount): FinancialAccount {
    this.accounts.set(acc.id, acc);
    return acc;
  }

  updateAccountBalance(id: string, balance: number, availableBalance: number): FinancialAccount | undefined {
    const acc = this.accounts.get(id);
    if (acc) {
      acc.balance = balance;
      acc.availableBalance = availableBalance;
      acc.lastSyncedAt = new Date().toISOString();
      this.accounts.set(id, acc);
    }
    return acc;
  }

  disconnectAccount(id: string, userId: string): boolean {
    const acc = this.accounts.get(id);
    if (acc && acc.userId === userId) {
      acc.status = 'disconnected';
      this.accounts.set(id, acc);
      this.logAudit(userId, 'ACCOUNT_DISCONNECTED', `Disconnected account ${acc.bankName} ${acc.maskedAccountNumber}`);
      return true;
    }
    return false;
  }

  reconnectAccount(id: string, userId: string): boolean {
    const acc = this.accounts.get(id);
    if (acc && acc.userId === userId) {
      acc.status = 'active';
      acc.errorMessage = undefined;
      acc.lastSyncedAt = new Date().toISOString();
      this.accounts.set(id, acc);
      this.logAudit(userId, 'ACCOUNT_RECONNECTED', `Reconnected account ${acc.bankName} ${acc.maskedAccountNumber}`);
      return true;
    }
    return false;
  }

  setAccountAttention(id: string, errorMessage?: string): boolean {
    const acc = this.accounts.get(id);
    if (acc) {
      acc.status = 'needs_attention';
      acc.errorMessage = errorMessage || 'We need you to reconnect this account before we can update it.';
      this.accounts.set(id, acc);
      return true;
    }
    return false;
  }

  // --- TRANSACTIONS WITH DEDUPLICATION ---
  /**
   * Upserts a transaction with mandatory deduplication on (providerId + providerTransactionId).
   * Returns: { transaction: CanonicalTransaction, isNew: boolean }
   */
  upsertTransaction(txData: Omit<CanonicalTransaction, 'id' | 'createdAt'>): { transaction: CanonicalTransaction; isNew: boolean } {
    const dedupKey = `${txData.providerId}:${txData.providerTransactionId}`;
    const existingId = this.txUniqueIndex.get(dedupKey);

    if (existingId && this.transactions.has(existingId)) {
      // Duplicate incoming transaction - preserve user's CashDeck categorization and notes!
      const existing = this.transactions.get(existingId)!;
      // Only update bank data if changed (e.g. status transition from Pending to Completed)
      existing.status = txData.status;
      existing.amount = txData.amount;
      existing.originalDescription = txData.originalDescription;
      this.transactions.set(existingId, existing);
      return { transaction: existing, isNew: false };
    }

    // New transaction
    const newId = `tx_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx: CanonicalTransaction = {
      ...txData,
      id: newId,
      createdAt: new Date().toISOString()
    };

    this.transactions.set(newId, newTx);
    this.txUniqueIndex.set(dedupKey, newId);
    return { transaction: newTx, isNew: true };
  }

  getTransactions(userId: string, filters?: {
    accountId?: string;
    direction?: 'inflow' | 'outflow';
    category?: string;
    search?: string;
  }): CanonicalTransaction[] {
    let list = Array.from(this.transactions.values()).filter(t => t.userId === userId);

    if (filters?.accountId && filters.accountId !== 'all') {
      list = list.filter(t => t.accountId === filters.accountId);
    }

    if (filters?.direction) {
      list = list.filter(t => t.direction === filters.direction);
    }

    if (filters?.category && filters.category !== 'all') {
      list = list.filter(t => t.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        t =>
          t.originalDescription.toLowerCase().includes(q) ||
          (t.sender && t.sender.toLowerCase().includes(q)) ||
          (t.recipient && t.recipient.toLowerCase().includes(q)) ||
          (t.merchant && t.merchant.toLowerCase().includes(q)) ||
          t.referenceId.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  updateCashDeckTransactionMetadata(
    id: string,
    userId: string,
    updates: {
      category?: string;
      classification?: 'Personal' | 'Business' | 'Transfer' | 'Unknown';
      notes?: string;
    }
  ): CanonicalTransaction | undefined {
    const tx = this.transactions.get(id);
    if (!tx || tx.userId !== userId) return undefined;

    if (updates.category !== undefined) tx.category = updates.category;
    if (updates.classification !== undefined) {
      tx.classification = updates.classification;
      tx.isBusiness = updates.classification === 'Business';
    }
    if (updates.notes !== undefined) tx.notes = updates.notes;

    this.transactions.set(id, tx);
    return tx;
  }

  // --- MANUAL CASH TRANSACTIONS ---
  addCashTransaction(
    userId: string,
    description: string,
    amount: number,
    category: string,
    classification: 'Personal' | 'Business'
  ): CanonicalTransaction {
    const id = `tx_cash_${Date.now()}`;
    const newTx: CanonicalTransaction = {
      id,
      providerId: 'cashdeck_manual',
      providerTransactionId: `cash_${Date.now()}`,
      accountId: 'acc_cash_drawer',
      userId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount,
      currency: 'NGN',
      direction: amount > 0 ? 'inflow' : 'outflow',
      originalDescription: description,
      referenceId: `CSH${Math.floor(100000 + Math.random() * 900000)}`,
      channel: 'Cash',
      category,
      classification,
      isCashEntry: true,
      isBusiness: classification === 'Business',
      status: 'Completed',
      createdAt: new Date().toISOString()
    };

    this.transactions.set(id, newTx);
    this.txUniqueIndex.set(`${newTx.providerId}:${newTx.providerTransactionId}`, id);
    this.logAudit(userId, 'CASH_TRANSACTION_RECORDED', `Manual cash entry: ${description} (₦${amount})`);
    return newTx;
  }

  // --- WEBHOOK DEDUPLICATION ---
  recordWebhookEvent(event: WebhookEvent): { isDuplicate: boolean } {
    if (this.processedWebhookEvents.has(event.eventId)) {
      return { isDuplicate: true };
    }
    this.processedWebhookEvents.set(event.eventId, event);
    return { isDuplicate: false };
  }

  // --- AUDIT LOGS ---
  logAudit(userId: string, action: string, details: string) {
    this.auditLogs.push({
      id: `audit_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  }

  getAuditLogs(userId: string): AuditLog[] {
    return this.auditLogs.filter(l => l.userId === userId);
  }

  // --- RESET ALL DATA (FOR TESTING ONBOARDING FROM SCRATCH) ---
  resetData() {
    this.users.clear();
    this.identityVerifications.clear();
    this.consents.clear();
    this.accounts.clear();
    this.transactions.clear();
    this.txUniqueIndex.clear();
    this.processedWebhookEvents.clear();
    this.syncRuns = [];
    this.auditLogs = [];
    this.seedDefaultUser();
  }
}

export const db = new FinancialDatabase();
