import { Router, Request, Response } from 'express';
import { db } from './database';
import { MockFinancialProviderAdapter } from './providerAdapter';
import { FinancialAccount } from './types';

export const apiRouter = Router();
const providerAdapter = new MockFinancialProviderAdapter();

// Helper to extract authenticated user ID
function getAuthUserId(req: Request): string {
  const headerUserId = req.headers['x-user-id'] as string;
  if (headerUserId && db.getUser(headerUserId)) {
    return headerUserId;
  }
  return db.getDefaultUserId();
}

// ==========================================
// 1. AUTHENTICATION & REGISTRATION
// ==========================================
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, emailOrPhone, password } = req.body;
  if (!name || !emailOrPhone) {
    return res.status(400).json({ error: 'Name and email or phone are required.' });
  }

  const existing = db.findUserByEmail(emailOrPhone);
  if (existing) {
    return res.status(200).json({ user: existing, message: 'Existing account found.' });
  }

  const user = db.createUser(name, emailOrPhone);
  res.status(201).json({ user, message: 'Account created successfully.' });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { emailOrPhone } = req.body;
  const user = db.findUserByEmail(emailOrPhone) || db.getUser(db.getDefaultUserId());
  res.json({ user });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = db.getUser(userId);
  const identity = db.getIdentity(userId);
  const consent = db.getConsent(userId);
  res.json({ user, identity, consent });
});

// ==========================================
// 2. IDENTITY VERIFICATION & KYC
// ==========================================
apiRouter.post('/identity/verify', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { idType = 'NIN', idNumber } = req.body;

  if (!idNumber || idNumber.trim().length < 4) {
    return res.status(400).json({ error: 'Please enter a valid identity number.' });
  }

  // Security: Clean and mask NIN/BVN immediately. Full number is never stored or exposed.
  const verification = db.verifyIdentity(userId, idType as 'NIN' | 'BVN', idNumber);
  res.json({
    success: true,
    verification: {
      status: verification.status,
      maskedId: verification.maskedId,
      verifiedAt: verification.verifiedAt,
      kycRef: verification.kycProviderRef
    }
  });
});

apiRouter.get('/identity/status', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const identity = db.getIdentity(userId);
  res.json({ identity: identity || { status: 'unverified' } });
});

// ==========================================
// 3. EXPLICIT CONSENT
// ==========================================
apiRouter.post('/consent', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { scopes = ['account_info', 'balances', 'transactions'] } = req.body;
  const ip = req.ip;

  const consent = db.grantConsent(userId, scopes, ip);
  res.json({ success: true, consent });
});

apiRouter.get('/consent', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const consent = db.getConsent(userId);
  res.json({ consent });
});

apiRouter.post('/consent/revoke', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const revoked = db.revokeConsent(userId);
  res.json({ success: revoked, message: 'Consent revoked.' });
});

// ==========================================
// 4. FINANCIAL ACCOUNT DISCOVERY & CONNECTION
// ==========================================
apiRouter.get('/financial/discover', async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const identity = db.getIdentity(userId);

  if (!identity || identity.status !== 'verified') {
    return res.status(403).json({ error: 'Identity must be verified before account discovery.' });
  }

  try {
    const discovered = await providerAdapter.discoverAccounts(identity.kycProviderRef);
    res.json({
      provider: providerAdapter.name,
      isMock: providerAdapter.isMock,
      discoveredAccounts: discovered
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to discover accounts from provider.' });
  }
});

apiRouter.post('/financial/connect', async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { accountsToConnect } = req.body; // array of discovered accounts

  if (!Array.isArray(accountsToConnect) || accountsToConnect.length === 0) {
    return res.status(400).json({ error: 'No accounts selected to connect.' });
  }

  const connectedAccounts: FinancialAccount[] = [];

  for (const disc of accountsToConnect) {
    const accId = `acc_${disc.bankName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${Math.floor(10 + Math.random() * 90)}`;
    const newAcc: FinancialAccount = {
      id: accId,
      userId,
      providerId: providerAdapter.id,
      providerAccountId: disc.providerAccountId,
      bankName: disc.bankName,
      name: disc.accountName,
      type: disc.type,
      maskedAccountNumber: disc.maskedAccountNumber,
      balance: disc.balance,
      availableBalance: disc.availableBalance,
      currency: disc.currency || 'NGN',
      isBusiness: false,
      status: 'active',
      lastSyncedAt: new Date().toISOString()
    };

    db.addOrUpdateAccount(newAcc);
    connectedAccounts.push(newAcc);

    // Retrieve initial transactions from provider
    const provTxs = await providerAdapter.getTransactions(disc.providerAccountId);
    for (const ptx of provTxs) {
      db.upsertTransaction({
        providerId: providerAdapter.id,
        providerTransactionId: ptx.providerTransactionId,
        accountId: newAcc.id,
        userId,
        date: ptx.date,
        time: ptx.time,
        amount: ptx.amount,
        currency: disc.currency || 'NGN',
        direction: ptx.direction,
        originalDescription: ptx.originalDescription,
        sender: ptx.sender,
        recipient: ptx.recipient,
        merchant: ptx.merchant,
        referenceId: ptx.referenceId,
        channel: ptx.channel,
        bankCategory: ptx.bankCategory,
        category: ptx.bankCategory || 'General',
        classification: 'Personal',
        isCashEntry: false,
        isBusiness: false,
        status: ptx.status
      });
    }
  }

  res.json({
    success: true,
    connectedAccounts,
    message: `${connectedAccounts.length} account(s) connected and synchronized successfully.`
  });
});

apiRouter.get('/financial/accounts', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const accounts = db.getAccounts(userId);

  // Compute total balances partitioned by currency
  const currencyTotals: { [currency: string]: number } = {};
  accounts.forEach(acc => {
    currencyTotals[acc.currency] = (currencyTotals[acc.currency] || 0) + acc.balance;
  });

  res.json({
    accounts,
    currencyTotals,
    totalBalanceNGN: currencyTotals['NGN'] || 0
  });
});

apiRouter.post('/financial/accounts/:id/refresh', async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const accountId = req.params.id;

  const accounts = db.getAccounts(userId);
  const targets = accountId === 'all' ? accounts : accounts.filter(a => a.id === accountId);

  if (targets.length === 0) {
    return res.status(404).json({ error: 'Account not found.' });
  }

  let updatedCount = 0;
  for (const acc of targets) {
    try {
      const refreshed = await providerAdapter.refreshAccount(acc.providerAccountId);
      db.updateAccountBalance(acc.id, refreshed.balance, refreshed.balance);
      updatedCount++;
    } catch {
      // Don't erase existing data if refresh fails
    }
  }

  res.json({
    success: true,
    message: updatedCount > 1 ? 'All accounts refreshed.' : 'Account refreshed.',
    updatedCount
  });
});

apiRouter.post('/financial/accounts/:id/reconnect', async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const accountId = req.params.id;

  const reconnected = db.reconnectAccount(accountId, userId);
  if (reconnected) {
    const acc = db.getAccount(accountId);
    if (acc) {
      providerAdapter.setAccountStatus(acc.providerAccountId, 'active');
    }
    return res.json({ success: true, message: 'Account reconnected successfully.' });
  }
  res.status(404).json({ error: 'Account not found.' });
});

apiRouter.post('/financial/accounts/:id/disconnect', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const accountId = req.params.id;

  const disconnected = db.disconnectAccount(accountId, userId);
  if (disconnected) {
    return res.json({ success: true, message: 'Account disconnected.' });
  }
  res.status(404).json({ error: 'Account not found.' });
});

// ==========================================
// 5. TRANSACTIONS
// ==========================================
apiRouter.get('/transactions', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { accountId, direction, category, search } = req.query as any;

  const list = db.getTransactions(userId, {
    accountId,
    direction,
    category,
    search
  });

  res.json({
    transactions: list,
    count: list.length
  });
});

apiRouter.patch('/transactions/:id', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { id } = req.params;
  const { category, classification, notes } = req.body;

  const updated = db.updateCashDeckTransactionMetadata(id, userId, {
    category,
    classification,
    notes
  });

  if (!updated) {
    return res.status(404).json({ error: 'Transaction not found.' });
  }

  res.json({ success: true, transaction: updated });
});

// Manual Cash Entry
apiRouter.post('/transactions/cash', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { description, amount, category = 'General', classification = 'Personal' } = req.body;

  if (!description || typeof amount !== 'number') {
    return res.status(400).json({ error: 'Description and amount are required.' });
  }

  const tx = db.addCashTransaction(userId, description, amount, category, classification);
  res.status(201).json({ success: true, transaction: tx });
});

// ==========================================
// 6. WEBHOOKS WITH SIGNATURE VERIFICATION
// ==========================================
apiRouter.post('/webhooks/financial', async (req: Request, res: Response) => {
  const signature = (req.headers['x-provider-signature'] as string) || 'sig_demo';
  const payload = req.body;

  // Verify signature
  const isValid = providerAdapter.verifyWebhookSignature(signature, JSON.stringify(payload));
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid webhook signature.' });
  }

  const eventId = payload.eventId || `evt_${Date.now()}`;
  const dedup = db.recordWebhookEvent({
    id: `wb_${Date.now()}`,
    eventId,
    provider: providerAdapter.id,
    eventType: payload.eventType || 'transaction.created',
    signature,
    payload,
    processedAt: new Date().toISOString(),
    status: 'processed'
  });

  if (dedup.isDuplicate) {
    return res.status(200).json({ status: 'duplicate_ignored', message: 'Webhook already processed.' });
  }

  // Process event
  const result = await providerAdapter.handleWebhook(payload);
  if (result.transactions && result.transactions.length > 0) {
    const userId = db.getDefaultUserId();
    const account = db.getAccounts(userId).find(a => a.providerAccountId === result.accountId) || db.getAccounts(userId)[0];

    for (const ptx of result.transactions) {
      db.upsertTransaction({
        providerId: providerAdapter.id,
        providerTransactionId: ptx.providerTransactionId,
        accountId: account ? account.id : 'acc_default',
        userId,
        date: ptx.date,
        time: ptx.time,
        amount: ptx.amount,
        currency: 'NGN',
        direction: ptx.direction,
        originalDescription: ptx.originalDescription,
        sender: ptx.sender,
        recipient: ptx.recipient,
        merchant: ptx.merchant,
        referenceId: ptx.referenceId,
        channel: ptx.channel,
        bankCategory: ptx.bankCategory,
        category: ptx.bankCategory || 'Transfer',
        classification: 'Personal',
        isCashEntry: false,
        isBusiness: false,
        status: ptx.status
      });

      if (account) {
        db.updateAccountBalance(account.id, account.balance + ptx.amount, account.availableBalance + ptx.amount);
      }
    }
  }

  res.json({ status: 'processed', eventId: result.eventId });
});

// ==========================================
// 7. DEV & SIMULATION HELPERS
// ==========================================
apiRouter.post('/dev/simulate-webhook', async (req: Request, res: Response) => {
  const { accountId = 'gtb_01', amount = 75000, description = 'Direct Deposit from Apex Ltd' } = req.body;
  const eventId = `evt_sim_${Date.now()}`;

  const payload = {
    eventId,
    eventType: 'transaction.created',
    accountId,
    transaction: {
      providerTransactionId: `TRX_SIM_${Date.now()}`,
      amount,
      direction: amount > 0 ? 'inflow' : 'outflow',
      originalDescription: description,
      sender: amount > 0 ? 'Apex Ltd' : undefined,
      recipient: amount < 0 ? 'Apex Ltd' : undefined,
      referenceId: `SIM${Math.floor(1000000 + Math.random() * 9000000)}`,
      channel: 'Bank Transfer',
      bankCategory: 'Direct Settlement',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Completed'
    }
  };

  // Re-route internally through the webhook endpoint
  const dedup = db.recordWebhookEvent({
    id: `wb_${Date.now()}`,
    eventId,
    provider: providerAdapter.id,
    eventType: 'transaction.created',
    signature: 'sig_simulated_valid',
    payload,
    processedAt: new Date().toISOString(),
    status: 'processed'
  });

  const userId = getAuthUserId(req);
  const account = db.getAccounts(userId).find(a => a.providerAccountId === accountId) || db.getAccounts(userId)[0];

  if (account) {
    db.upsertTransaction({
      providerId: providerAdapter.id,
      providerTransactionId: payload.transaction.providerTransactionId,
      accountId: account.id,
      userId,
      date: payload.transaction.date,
      time: payload.transaction.time,
      amount: payload.transaction.amount,
      currency: 'NGN',
      direction: payload.transaction.direction as any,
      originalDescription: payload.transaction.originalDescription,
      sender: payload.transaction.sender,
      recipient: payload.transaction.recipient,
      referenceId: payload.transaction.referenceId,
      channel: payload.transaction.channel as any,
      bankCategory: payload.transaction.bankCategory,
      category: 'Income',
      classification: 'Business',
      isCashEntry: false,
      isBusiness: true,
      status: 'Completed'
    });

    db.updateAccountBalance(account.id, account.balance + amount, account.availableBalance + amount);
  }

  res.json({
    success: true,
    message: 'Simulated webhook event received and processed.',
    eventId,
    account: account?.bankName,
    amount
  });
});

apiRouter.post('/dev/simulate-attention', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { accountId } = req.body;
  const accounts = db.getAccounts(userId);
  const target = accountId ? accounts.find(a => a.id === accountId) : accounts[0];

  if (target) {
    db.setAccountAttention(target.id, 'Session expired with provider. Re-authentication required.');
    providerAdapter.setAccountStatus(target.providerAccountId, 'needs_attention');
    return res.json({ success: true, account: target.bankName, status: 'needs_attention' });
  }

  res.status(404).json({ error: 'No accounts found.' });
});

apiRouter.post('/dev/reset', (req: Request, res: Response) => {
  db.resetData();
  res.json({ success: true, message: 'Database reset to default seed state.' });
});

apiRouter.get('/dev/status', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = db.getUser(userId);
  const accounts = db.getAccounts(userId);
  const audit = db.getAuditLogs(userId);

  res.json({
    mode: 'development',
    provider: providerAdapter.name,
    isMock: providerAdapter.isMock,
    connectedAccountsCount: accounts.length,
    user: user?.name,
    auditLogCount: audit.length
  });
});
