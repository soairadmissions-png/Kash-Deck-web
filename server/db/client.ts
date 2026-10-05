import fs from 'fs';
import path from 'path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import { env } from '../config/env';

// Ensure data directory exists for embedded Postgres persistence
const dbDir = path.resolve(process.cwd(), env.DB_STORAGE_DIR);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize PGlite database
export const pglite = new PGlite(dbDir);
export const db = drizzle(pglite, { schema });

// Initialize database schema tables via DDL if not already created
export async function initializeDatabase() {
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

    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      occupation TEXT,
      financial_focus TEXT,
      income_regularity TEXT,
      expected_monthly_income_minor INTEGER,
      expected_monthly_expenses_minor INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      refresh_token_hash TEXT NOT NULL,
      device TEXT,
      ip TEXT,
      user_agent TEXT,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      created_at TEXT NOT NULL
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

    CREATE TABLE IF NOT EXISTS business_profiles (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      legal_name TEXT NOT NULL,
      business_type TEXT NOT NULL DEFAULT 'Retail',
      current_tracking_method TEXT,
      sales_entry_mode TEXT NOT NULL DEFAULT 'daily',
      feature_profile TEXT NOT NULL DEFAULT '{"inventory":true,"customers":true,"suppliers":true}',
      expected_monthly_sales_minor INTEGER,
      expected_monthly_expenses_minor INTEGER,
      rc_number TEXT,
      tin TEXT,
      address TEXT,
      is_vat_registered INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS onboarding_answers (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      step_key TEXT NOT NULL,
      payload_json TEXT NOT NULL DEFAULT '{}',
      completed_at TEXT NOT NULL,
      skipped INTEGER NOT NULL DEFAULT 0
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

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      parent_id TEXT,
      icon TEXT,
      color TEXT,
      is_business_cogs INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      occurred_at TEXT NOT NULL,
      amount_minor INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'NGN',
      description TEXT NOT NULL,
      original_description TEXT,
      merchant_id TEXT,
      category_id TEXT,
      classification TEXT NOT NULL DEFAULT 'Personal',
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'posted',
      source TEXT NOT NULL DEFAULT 'manual',
      external_id TEXT,
      dedupe_hash TEXT,
      transfer_group_id TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
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

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      target_amount_minor INTEGER NOT NULL,
      current_amount_minor INTEGER NOT NULL DEFAULT 0,
      target_date TEXT NOT NULL,
      icon_name TEXT NOT NULL DEFAULT 'Target',
      color TEXT NOT NULL DEFAULT '#047857',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
      actor_id TEXT,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      before_snapshot TEXT,
      after_snapshot TEXT,
      ip TEXT,
      request_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
    CREATE INDEX IF NOT EXISTS idx_members_workspace ON workspace_members(workspace_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_accounts_workspace ON accounts(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_workspace ON transactions(workspace_id, occurred_at);
    CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace ON audit_logs(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_daily_sales_workspace_date ON daily_sales_entries(workspace_id, date);
    CREATE INDEX IF NOT EXISTS idx_goals_workspace ON goals(workspace_id);
  `);

  // Safe migrations for newly added columns if table already existed
  try {
    await pglite.exec(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS active_workspace_id TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_version TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_at TEXT;

      ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS onboarding_status TEXT NOT NULL DEFAULT 'not_started';
      ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS onboarding_step TEXT NOT NULL DEFAULT 'welcome';

      ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS current_tracking_method TEXT;
      ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS sales_entry_mode TEXT NOT NULL DEFAULT 'daily';
      ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS feature_profile TEXT NOT NULL DEFAULT '{"inventory":true,"customers":true,"suppliers":true}';
      ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS expected_monthly_sales_minor INTEGER;
      ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS expected_monthly_expenses_minor INTEGER;
    `);
  } catch (migErr) {
    console.warn('[CashDeck DB] Safe column migration notice:', migErr);
  }

  console.log('[CashDeck DB] PostgreSQL schema initialized successfully.');

  // Seed default demo user and accounts for frictionless testing
  try {
    const demoEmail = 'demo@cashdeck.ng';
    const existing = await db.select().from(schema.users).where(eq(schema.users.email, demoEmail));
    if (existing.length === 0) {
      const demoUserId = 'usr_demo_cashdeck_01';
      const now = new Date().toISOString();
      const pwHash = await bcrypt.hash('Password123!', 10);

      await db.insert(schema.users).values({
        id: demoUserId,
        email: demoEmail,
        phone: '+2348012345678',
        name: 'Ada Lovelace',
        passwordHash: pwHash,
        emailVerifiedAt: now,
        phoneVerifiedAt: now,
        status: 'active',
        activeWorkspaceId: 'ws_demo_personal',
        createdAt: now,
        updatedAt: now
      });

      // Seed Personal Workspace
      await db.insert(schema.workspaces).values({
        id: 'ws_demo_personal',
        type: 'personal',
        name: "Ada's Finances",
        currency: 'NGN',
        ownerId: demoUserId,
        onboardingStatus: 'completed',
        onboardingStep: 'p4',
        isDemo: 1,
        createdAt: now,
        updatedAt: now
      });

      // Seed Business Workspace
      await db.insert(schema.workspaces).values({
        id: 'ws_demo_business',
        type: 'business',
        name: 'Ada Retail Store',
        currency: 'NGN',
        ownerId: demoUserId,
        onboardingStatus: 'completed',
        onboardingStep: 'b4',
        isDemo: 1,
        createdAt: now,
        updatedAt: now
      });

      await db.insert(schema.workspaceMembers).values([
        {
          id: 'mem_demo_p1',
          workspaceId: 'ws_demo_personal',
          userId: demoUserId,
          role: 'owner',
          createdAt: now
        },
        {
          id: 'mem_demo_b1',
          workspaceId: 'ws_demo_business',
          userId: demoUserId,
          role: 'owner',
          createdAt: now
        }
      ]);

      // Seed bank accounts for Personal
      await db.insert(schema.accounts).values([
        {
          id: 'acc_demo_gtb_1',
          workspaceId: 'ws_demo_personal',
          type: 'checking',
          institution: 'GTBank',
          name: 'GTBank Current Account',
          maskedNumber: '•••• 4921',
          currency: 'NGN',
          openingBalanceMinor: 125000000,
          currentBalanceMinor: 125000000,
          availableBalanceMinor: 125000000,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'acc_demo_gtb_2',
          workspaceId: 'ws_demo_personal',
          type: 'savings',
          institution: 'GTBank',
          name: 'GTBank Savings Account',
          maskedNumber: '•••• 8812',
          currency: 'NGN',
          openingBalanceMinor: 62000000,
          currentBalanceMinor: 62000000,
          availableBalanceMinor: 62000000,
          createdAt: now,
          updatedAt: now
        }
      ]);

      console.log('[CashDeck DB] Default demo user (demo@cashdeck.ng) seeded.');
    }
  } catch (seedErr) {
    console.warn('[CashDeck DB] Demo seed notice:', seedErr);
  }
}
