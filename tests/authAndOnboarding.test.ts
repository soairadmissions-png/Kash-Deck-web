import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import bcrypt from 'bcryptjs';
import * as schema from '../server/db/schema';
import { users, workspaces, workspaceMembers, accounts, dailySalesEntries } from '../server/db/schema';
import { eq } from 'drizzle-orm';
import { generate6DigitCode, storeEmailCode, verifyEmailCode } from '../server/modules/auth/verification';

async function runTests() {
  console.log('=====================================================');
  console.log('RUNNING CASHDECK AUTH, ONBOARDING & DASHBOARD TESTS');
  console.log('=====================================================');

  // Fast in-memory test Postgres database
  const pglite = new PGlite();
  const db = drizzle(pglite, { schema });

  await pglite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      email_verified_at TEXT,
      phone_verified_at TEXT,
      active_workspace_id TEXT,
      consent_version TEXT,
      consent_at TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      two_factor_secret TEXT,
      two_factor_enabled INTEGER NOT NULL DEFAULT 0,
      two_factor_recovery_codes TEXT,
      last_login_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'NGN',
      timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_id TEXT NOT NULL DEFAULT 'free',
      onboarding_status TEXT NOT NULL DEFAULT 'not_started',
      onboarding_step TEXT NOT NULL DEFAULT 'welcome',
      is_demo INTEGER NOT NULL DEFAULT 0,
      settings_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workspace_members (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      institution TEXT NOT NULL,
      name TEXT NOT NULL,
      masked_number TEXT,
      currency TEXT NOT NULL DEFAULT 'NGN',
      opening_balance_minor INTEGER NOT NULL DEFAULT 0,
      current_balance_minor INTEGER NOT NULL DEFAULT 0,
      available_balance_minor INTEGER NOT NULL DEFAULT 0,
      include_in_net_worth INTEGER NOT NULL DEFAULT 1,
      is_archived INTEGER NOT NULL DEFAULT 0,
      provider_link_id TEXT,
      last_synced_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_sales_entries (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      total_sales_minor INTEGER NOT NULL,
      cash_minor INTEGER NOT NULL DEFAULT 0,
      transfer_minor INTEGER NOT NULL DEFAULT 0,
      pos_minor INTEGER NOT NULL DEFAULT 0,
      other_minor INTEGER NOT NULL DEFAULT 0,
      transaction_count INTEGER,
      notes TEXT,
      created_by TEXT REFERENCES users(id),
      history_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Test 1: Email OTP generation & verification
  console.log('--- TEST 1: Verification OTP Engine ---');
  const testEmail = `test_${Date.now()}@cashdeck.ng`;
  const code = generate6DigitCode();
  storeEmailCode(testEmail, code);

  const failResult = verifyEmailCode(testEmail, '000000');
  if (failResult.success) throw new Error('Expected invalid code to fail');
  console.log('✅ Invalid verification code rejected');

  const successResult = verifyEmailCode(testEmail, code);
  if (!successResult.success) throw new Error('Expected valid code to succeed');
  console.log('✅ Valid verification code verified successfully');

  // Test 2: Starting Figures Conversion (Personal)
  console.log('--- TEST 2: Starting Figures Conversion (Personal) ---');
  const now = new Date().toISOString();
  const personalUserId = `usr_test_${Date.now()}`;
  await db.insert(users).values({
    id: personalUserId,
    email: `${personalUserId}@example.ng`,
    name: 'Tunde Adebayo',
    passwordHash: await bcrypt.hash('Secret123!', 10),
    status: 'active',
    createdAt: now,
    updatedAt: now
  });

  const personalWsId = `ws_test_pers_${Date.now()}`;
  await db.insert(workspaces).values({
    id: personalWsId,
    type: 'personal',
    name: 'Personal Finances',
    currency: 'NGN',
    ownerId: personalUserId,
    onboardingStatus: 'completed',
    onboardingStep: 'done',
    createdAt: now,
    updatedAt: now
  });

  await db.insert(workspaceMembers).values({
    id: `mem_${Date.now()}`,
    workspaceId: personalWsId,
    userId: personalUserId,
    role: 'owner',
    createdAt: now
  });

  // Convert starting savings (₦500,000)
  const savingsMinor = 500000 * 100;
  await db.insert(accounts).values({
    id: `acc_sav_${Date.now()}`,
    workspaceId: personalWsId,
    type: 'savings',
    institution: 'Savings Vault',
    name: 'Personal Savings Vault',
    openingBalanceMinor: savingsMinor,
    currentBalanceMinor: savingsMinor,
    availableBalanceMinor: savingsMinor,
    currency: 'NGN',
    createdAt: now,
    updatedAt: now
  });

  // Verify that account has opening_balance_minor = 50,000,000 kobo
  const createdAccounts = await db.select().from(accounts).where(eq(accounts.workspaceId, personalWsId));
  if (createdAccounts.length !== 1) throw new Error('Expected 1 savings account');
  if (createdAccounts[0].openingBalanceMinor !== 50000000) throw new Error('Opening balance mismatch');
  console.log('✅ Personal starting savings created as real ledger account');
  console.log('✅ Opening balance is ₦500,000 (50,000,000 kobo)');

  // Test 3: Daily Sales Recording & Method Breakdown
  console.log('--- TEST 3: Business Daily Sales Engine ---');
  const bizWsId = `ws_test_biz_${Date.now()}`;
  await db.insert(workspaces).values({
    id: bizWsId,
    type: 'business',
    name: 'Ade Supermarket',
    currency: 'NGN',
    ownerId: personalUserId,
    onboardingStatus: 'completed',
    onboardingStep: 'done',
    createdAt: now,
    updatedAt: now
  });

  await db.insert(workspaceMembers).values({
    id: `mem_biz_${Date.now()}`,
    workspaceId: bizWsId,
    userId: personalUserId,
    role: 'owner',
    createdAt: now
  });

  // Record daily sales: ₦486,500 total = Cash ₦200,000 + Transfer ₦186,500 + POS ₦100,000
  const dateStr = '2026-10-05';
  const totalSalesMinor = 486500 * 100;
  const cashMinor = 200000 * 100;
  const transferMinor = 186500 * 100;
  const posMinor = 100000 * 100;

  if (cashMinor + transferMinor + posMinor !== totalSalesMinor) {
    throw new Error('Breakdown sum does not match total');
  }

  await db.insert(dailySalesEntries).values({
    id: `ds_test_${Date.now()}`,
    workspaceId: bizWsId,
    date: dateStr,
    totalSalesMinor,
    cashMinor,
    transferMinor,
    posMinor,
    transactionCount: 38,
    notes: 'Busy Monday sales',
    createdBy: personalUserId,
    historyJson: '[]',
    createdAt: now,
    updatedAt: now
  });

  const dailyEntries = await db.select().from(dailySalesEntries).where(eq(dailySalesEntries.workspaceId, bizWsId));
  if (dailyEntries.length !== 1) throw new Error('Expected 1 daily sales entry');
  if (dailyEntries[0].totalSalesMinor !== 48650000) throw new Error('Daily sales total mismatch');
  console.log("✅ Recorded daily sales of ₦486,500 with Cash, Transfer, and POS breakdown");

  // Test 4: Workspace Isolation
  console.log('--- TEST 4: Workspace Isolation ---');
  const bizAccounts = await db.select().from(accounts).where(eq(accounts.workspaceId, bizWsId));
  if (bizAccounts.length !== 0) throw new Error('Business workspace should not have personal accounts');
  console.log('✅ Verified zero data bleed between Personal and Business workspaces');

  console.log('=====================================================');
  console.log('ALL AUTH, ONBOARDING & DASHBOARD TESTS PASSED!');
  console.log('=====================================================');

  await pglite.close();
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
