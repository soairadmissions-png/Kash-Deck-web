import { pgTable, text, integer, uniqueIndex, index } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  emailVerifiedAt: text('email_verified_at'),
  phoneVerifiedAt: text('phone_verified_at'),
  activeWorkspaceId: text('active_workspace_id'),
  consentVersion: text('consent_version'),
  consentAt: text('consent_at'),
  status: text('status').notNull().default('active'),
  twoFactorSecret: text('two_factor_secret'),
  twoFactorEnabled: integer('two_factor_enabled').notNull().default(0),
  twoFactorRecoveryCodes: text('two_factor_recovery_codes'),
  lastLoginAt: text('last_login_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// 2. User Profiles Table
export const userProfiles = pgTable('user_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  occupation: text('occupation'),
  financialFocus: text('financial_focus'), // JSON array string
  incomeRegularity: text('income_regularity'),
  expectedMonthlyIncomeMinor: integer('expected_monthly_income_minor'),
  expectedMonthlyExpensesMinor: integer('expected_monthly_expenses_minor'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// 3. Sessions Table
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  device: text('device'),
  ip: text('ip'),
  userAgent: text('user_agent'),
  expiresAt: text('expires_at').notNull(),
  revokedAt: text('revoked_at'),
  createdAt: text('created_at').notNull()
});

// 4. Workspaces Table
export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'personal' | 'business'
  name: text('name').notNull(),
  currency: text('currency').notNull().default('NGN'),
  timezone: text('timezone').notNull().default('Africa/Lagos'),
  ownerId: text('owner_id').notNull().references(() => users.id),
  planId: text('plan_id').notNull().default('free'),
  onboardingStatus: text('onboarding_status').notNull().default('not_started'), // 'not_started' | 'in_progress' | 'completed'
  onboardingStep: text('onboarding_step').notNull().default('welcome'),
  isDemo: integer('is_demo').notNull().default(0),
  settingsJson: text('settings_json').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// 5. Workspace Members Table
export const workspaceMembers = pgTable('workspace_members', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role').notNull(), // 'owner' | 'manager' | 'cashier' | 'accountant' | 'viewer'
  createdAt: text('created_at').notNull()
});

// 6. Business Profiles Table
export const businessProfiles = pgTable('business_profiles', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  legalName: text('legal_name').notNull(),
  businessType: text('business_type').notNull().default('Retail'),
  currentTrackingMethod: text('current_tracking_method'),
  salesEntryMode: text('sales_entry_mode').notNull().default('daily'), // 'daily' | 'transaction'
  featureProfile: text('feature_profile').notNull().default('{"inventory":true,"customers":true,"suppliers":true}'),
  expectedMonthlySalesMinor: integer('expected_monthly_sales_minor'),
  expectedMonthlyExpensesMinor: integer('expected_monthly_expenses_minor'),
  rcNumber: text('rc_number'),
  tin: text('tin'),
  address: text('address'),
  isVatRegistered: integer('is_vat_registered').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// 7. Onboarding Answers Table (Persisted across devices & resumes)
export const onboardingAnswers = pgTable('onboarding_answers', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  stepKey: text('step_key').notNull(),
  payloadJson: text('payload_json').notNull().default('{}'),
  completedAt: text('completed_at').notNull(),
  skipped: integer('skipped').notNull().default(0)
});

// 8. Financial Accounts Table
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  type: text('type').notNull(), // 'bank' | 'cash' | 'wallet' | 'card' | 'loan' | 'credit' | 'savings' | 'investment'
  institution: text('institution').notNull(),
  name: text('name').notNull(),
  maskedNumber: text('masked_number'),
  currency: text('currency').notNull().default('NGN'),
  openingBalanceMinor: integer('opening_balance_minor').notNull().default(0),
  currentBalanceMinor: integer('current_balance_minor').notNull().default(0),
  availableBalanceMinor: integer('available_balance_minor').notNull().default(0),
  includeInNetWorth: integer('include_in_net_worth').notNull().default(1),
  isArchived: integer('is_archived').notNull().default(0),
  providerLinkId: text('provider_link_id'),
  lastSyncedAt: text('last_synced_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// 9. Categories Table
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id'), // null = system default
  name: text('name').notNull(),
  kind: text('kind').notNull(), // 'income' | 'expense' | 'transfer'
  parentId: text('parent_id'),
  icon: text('icon'),
  color: text('color'),
  isBusinessCogs: integer('is_business_cogs').notNull().default(0),
  createdAt: text('created_at').notNull()
});

// 10. Transactions Table
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  accountId: text('account_id').notNull().references(() => accounts.id),
  occurredAt: text('occurred_at').notNull(),
  amountMinor: integer('amount_minor').notNull(),
  currency: text('currency').notNull().default('NGN'),
  description: text('description').notNull(),
  originalDescription: text('original_description'),
  merchantId: text('merchant_id'),
  categoryId: text('category_id'),
  classification: text('classification').notNull().default('Personal'),
  notes: text('notes'),
  status: text('status').notNull().default('posted'), // 'posted' | 'pending' | 'needs_review' | 'reversed'
  source: text('source').notNull().default('manual'), // 'manual' | 'import' | 'bank' | 'sale' | 'purchase' | 'opening_balance'
  externalId: text('external_id'),
  dedupeHash: text('dedupe_hash'),
  transferGroupId: text('transfer_group_id'),
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at')
});

// 11. Daily Sales Entries Table (for Business Daily Sales Mode)
export const dailySalesEntries = pgTable('daily_sales_entries', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  date: text('date').notNull(), // 'YYYY-MM-DD'
  totalSalesMinor: integer('total_sales_minor').notNull(),
  cashMinor: integer('cash_minor').notNull().default(0),
  transferMinor: integer('transfer_minor').notNull().default(0),
  posMinor: integer('pos_minor').notNull().default(0),
  otherMinor: integer('other_minor').notNull().default(0),
  transactionCount: integer('transaction_count'),
  notes: text('notes'),
  createdBy: text('created_by').references(() => users.id),
  historyJson: text('history_json').notNull().default('[]'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// 12. Goals Table
export const goals = pgTable('goals', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  name: text('name').notNull(),
  category: text('category').notNull(),
  targetAmountMinor: integer('target_amount_minor').notNull(),
  currentAmountMinor: integer('current_amount_minor').notNull().default(0),
  targetDate: text('target_date').notNull(),
  iconName: text('icon_name').notNull().default('Target'),
  color: text('color').notNull().default('#047857'),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

// 13. Audit Logs Table (Append-only)
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id'),
  actorId: text('actor_id'),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: text('entity_id').notNull(),
  beforeSnapshot: text('before_snapshot'),
  afterSnapshot: text('after_snapshot'),
  ip: text('ip'),
  requestId: text('request_id'),
  createdAt: text('created_at').notNull()
});
