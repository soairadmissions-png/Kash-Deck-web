import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from './db/client';
import {
  users,
  sessions,
  workspaces,
  workspaceMembers,
  userProfiles,
  businessProfiles,
  onboardingAnswers,
  accounts,
  categories,
  transactions,
  dailySalesEntries,
  goals,
  auditLogs
} from './db/schema';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken
} from './modules/auth/tokens';
import {
  generate6DigitCode,
  storeEmailCode,
  verifyEmailCode,
  storePhoneCode,
  verifyPhoneCode,
  storeResetCode,
  verifyResetCode,
  consumeResetCode
} from './modules/auth/verification';
import { requireAuth, requireWorkspaceMember, AuthenticatedRequest } from './modules/auth/middleware';

export const apiV1Router = Router();

// ==========================================
// 1. AUTHENTICATION & SESSIONS
// ==========================================

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms and privacy policy'),
  consentVersion: z.string().default('v1.0')
});

apiV1Router.post('/auth/register', async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.issues[0]?.message || 'Invalid input data' });
  }

  const { name, email, phone, password, consentVersion } = parse.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Check existing user
  const existing = await db.select().from(users).where(eq(users.email, normalizedEmail));
  if (existing.length > 0) {
    return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const userId = `usr_${uuidv4().replace(/-/g, '').slice(0, 16)}`;

  await db.insert(users).values({
    id: userId,
    email: normalizedEmail,
    phone: phone ? phone.trim() : null,
    name: name.trim(),
    passwordHash,
    consentVersion,
    consentAt: now,
    status: 'active',
    createdAt: now,
    updatedAt: now
  });

  // Create initial profile
  await db.insert(userProfiles).values({
    id: `prof_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
    userId,
    createdAt: now,
    updatedAt: now
  });

  // Generate & send email verification code
  const emailCode = generate6DigitCode();
  storeEmailCode(normalizedEmail, emailCode);

  // Generate phone OTP if phone provided
  if (phone) {
    const phoneCode = generate6DigitCode();
    storePhoneCode(phone, phoneCode);
  }

  // Issue session and tokens
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashToken(refreshToken);
  const sessionId = `ses_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers['user-agent'] || '',
    expiresAt,
    createdAt: now
  });

  const accessToken = generateAccessToken({
    userId,
    email: normalizedEmail,
    name: name.trim()
  });

  // Audit log
  await db.insert(auditLogs).values({
    id: `aud_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
    actorId: userId,
    action: 'user.registered',
    entity: 'user',
    entityId: userId,
    ip: req.ip,
    createdAt: now
  });

  // Set httpOnly secure refresh cookie
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.status(201).json({
    user: {
      id: userId,
      email: normalizedEmail,
      name: name.trim(),
      phone: phone ? phone.trim() : null,
      emailVerifiedAt: null,
      phoneVerifiedAt: null,
      activeWorkspaceId: null
    },
    accessToken,
    devCode: emailCode
  });
});

const loginSchema = z.object({
  email: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password required')
});

apiV1Router.post('/auth/login', async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.issues[0]?.message || 'Please enter your email or phone number and password.' });
  }

  const { email, password } = parse.data;
  const cleanId = email.trim();
  const lowerId = cleanId.toLowerCase();

  // Search by email first
  let userRows = await db.select().from(users).where(eq(users.email, lowerId));

  // If not found, search by phone
  if (userRows.length === 0) {
    userRows = await db.select().from(users).where(eq(users.phone, cleanId));
  }
  if (userRows.length === 0) {
    const strippedPhone = cleanId.replace(/[\s-]/g, '');
    userRows = await db.select().from(users).where(eq(users.phone, strippedPhone));
  }

  // If still not found, check if demo user should be auto-created
  if (userRows.length === 0 && (lowerId === 'demo@cashdeck.ng' || cleanId === '+2348012345678' || lowerId === 'demo')) {
    const demoId = 'usr_demo_cashdeck_01';
    const pwHash = await bcrypt.hash('Password123!', 10);
    const nowStr = new Date().toISOString();
    try {
      await db.insert(users).values({
        id: demoId,
        email: 'demo@cashdeck.ng',
        phone: '+2348012345678',
        name: 'Ada Lovelace',
        passwordHash: pwHash,
        emailVerifiedAt: nowStr,
        phoneVerifiedAt: nowStr,
        status: 'active',
        activeWorkspaceId: 'ws_demo_personal',
        createdAt: nowStr,
        updatedAt: nowStr
      });
      userRows = await db.select().from(users).where(eq(users.id, demoId));
    } catch {}
  }

  if (userRows.length === 0) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const u = userRows[0];
  const valid = await bcrypt.compare(password, u.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const now = new Date().toISOString();
  await db.update(users).set({ lastLoginAt: now }).where(eq(users.id, u.id));

  // Create session
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashToken(refreshToken);
  const sessionId = `ses_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await db.insert(sessions).values({
    id: sessionId,
    userId: u.id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers['user-agent'] || '',
    expiresAt,
    createdAt: now
  });

  const accessToken = generateAccessToken({
    userId: u.id,
    email: u.email,
    name: u.name,
    workspaceId: u.activeWorkspaceId || undefined
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  // Get active workspace details if any
  let activeWorkspace = null;
  if (u.activeWorkspaceId) {
    const wsRows = await db.select().from(workspaces).where(eq(workspaces.id, u.activeWorkspaceId));
    if (wsRows.length > 0) {
      activeWorkspace = wsRows[0];
    }
  }

  res.json({
    user: {
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      emailVerifiedAt: u.emailVerifiedAt,
      phoneVerifiedAt: u.phoneVerifiedAt,
      activeWorkspaceId: u.activeWorkspaceId
    },
    activeWorkspace,
    accessToken
  });
});

apiV1Router.post('/auth/logout', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const refreshToken = req.cookies?.refresh_token;
  if (refreshToken) {
    const rHash = hashToken(refreshToken);
    await db.update(sessions).set({ revokedAt: new Date().toISOString() }).where(eq(sessions.refreshTokenHash, rHash));
  }

  res.clearCookie('refresh_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

apiV1Router.post('/auth/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token provided.' });
  }

  const rHash = hashToken(refreshToken);
  const sessionRows = await db.select().from(sessions).where(and(eq(sessions.refreshTokenHash, rHash)));

  if (sessionRows.length === 0 || sessionRows[0].revokedAt || new Date(sessionRows[0].expiresAt) < new Date()) {
    res.clearCookie('refresh_token');
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }

  const session = sessionRows[0];
  const userRows = await db.select().from(users).where(eq(users.id, session.userId));
  if (userRows.length === 0) {
    return res.status(401).json({ error: 'User not found.' });
  }

  const u = userRows[0];

  // Rotate refresh token
  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashToken(newRefreshToken);

  await db
    .update(sessions)
    .set({ refreshTokenHash: newRefreshTokenHash })
    .where(eq(sessions.id, session.id));

  const newAccessToken = generateAccessToken({
    userId: u.id,
    email: u.email,
    name: u.name,
    workspaceId: u.activeWorkspaceId || undefined
  });

  res.cookie('refresh_token', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.json({ accessToken: newAccessToken });
});

apiV1Router.post('/auth/verify-email', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Please enter the 6-digit verification code.' });
  }

  const result = verifyEmailCode(req.user!.email, code);
  if (!result.success) {
    return res.status(400).json({ error: result.error || 'Verification failed.' });
  }

  const now = new Date().toISOString();
  await db.update(users).set({ emailVerifiedAt: now }).where(eq(users.id, req.user!.id));

  res.json({ success: true, verifiedAt: now, message: 'Email verified successfully.' });
});

apiV1Router.post('/auth/verify-phone', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { code } = req.body;
  if (!req.user!.phone) {
    return res.status(400).json({ error: 'No phone number attached to this account.' });
  }

  const result = verifyPhoneCode(req.user!.phone, code);
  if (!result.success) {
    return res.status(400).json({ error: result.error || 'Phone verification failed.' });
  }

  const now = new Date().toISOString();
  await db.update(users).set({ phoneVerifiedAt: now }).where(eq(users.id, req.user!.id));

  res.json({ success: true, verifiedAt: now, message: 'Phone verified successfully.' });
});

apiV1Router.post('/auth/resend', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { type = 'email' } = req.body;

  if (type === 'email') {
    const code = generate6DigitCode();
    storeEmailCode(req.user!.email, code);
    return res.json({ success: true, message: `A new code has been sent to ${req.user!.email}` });
  } else if (type === 'phone' && req.user!.phone) {
    const code = generate6DigitCode();
    storePhoneCode(req.user!.phone, code);
    return res.json({ success: true, message: `A new OTP has been sent to ${req.user!.phone}` });
  }

  res.status(400).json({ error: 'Invalid verification type or missing phone number.' });
});

apiV1Router.post('/auth/forgot-password', async (req, res) => {
  const { identifier } = req.body;
  if (!identifier || typeof identifier !== 'string') {
    return res.status(400).json({ error: 'Please enter your email address or phone number.' });
  }

  const idTrimmed = identifier.trim().toLowerCase();
  // Find user by email or phone
  const userRows = await db
    .select()
    .from(users)
    .where(sql`${users.email} = ${idTrimmed} OR ${users.phone} = ${idTrimmed}`);

  // Even if user not found, don't leak user enumeration in production, but generate code for valid accounts
  const code = generate6DigitCode();
  storeResetCode(idTrimmed, code);

  return res.json({
    success: true,
    message: `Verification code sent to ${identifier}.`,
    // For convenience in testing / local dev
    devCode: process.env.NODE_ENV !== 'production' ? code : undefined
  });
});

apiV1Router.post('/auth/verify-reset-code', async (req, res) => {
  const { identifier, code } = req.body;
  if (!identifier || !code) {
    return res.status(400).json({ error: 'Identifier and 6-digit code are required.' });
  }

  const result = verifyResetCode(identifier, code);
  if (!result.success) {
    return res.status(400).json({ error: result.error || 'Invalid or expired code.' });
  }

  return res.json({ success: true, message: 'Code verified successfully.' });
});

apiV1Router.post('/auth/reset-password', async (req, res) => {
  const { identifier, code, newPassword } = req.body;
  if (!identifier || !code || !newPassword) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const result = verifyResetCode(identifier, code);
  if (!result.success) {
    return res.status(400).json({ error: result.error || 'Invalid or expired reset session.' });
  }

  const idTrimmed = identifier.trim().toLowerCase();
  const userRows = await db
    .select()
    .from(users)
    .where(sql`${users.email} = ${idTrimmed} OR ${users.phone} = ${idTrimmed}`);

  if (userRows.length === 0) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  const targetUser = userRows[0];
  const newHash = await bcrypt.hash(newPassword, 10);
  const now = new Date().toISOString();

  await db
    .update(users)
    .set({ passwordHash: newHash, updatedAt: now })
    .where(eq(users.id, targetUser.id));

  // Revoke all existing sessions for security
  await db
    .update(sessions)
    .set({ revokedAt: now })
    .where(eq(sessions.userId, targetUser.id));

  consumeResetCode(identifier);

  return res.json({ success: true, message: 'Password has been reset successfully.' });
});

// ==========================================
// 2. USER & WORKSPACES
// ==========================================

apiV1Router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  // Fetch user workspaces with membership role
  const memberWorkspaces = await db
    .select({
      id: workspaces.id,
      type: workspaces.type,
      name: workspaces.name,
      currency: workspaces.currency,
      onboardingStatus: workspaces.onboardingStatus,
      onboardingStep: workspaces.onboardingStep,
      isDemo: workspaces.isDemo,
      role: workspaceMembers.role,
      createdAt: workspaces.createdAt
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId));

  // Determine active workspace
  let activeWs = memberWorkspaces.find(w => w.id === req.user!.activeWorkspaceId) || memberWorkspaces[0] || null;

  // Profile data
  const profileRows = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
  const profile = profileRows[0] || null;

  res.json({
    user: req.user,
    profile,
    activeWorkspaceId: activeWs ? activeWs.id : null,
    activeWorkspace: activeWs,
    workspaces: memberWorkspaces
  });
});

apiV1Router.post('/workspaces', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const schema = z.object({
    type: z.enum(['personal', 'business']),
    name: z.string().optional()
  });

  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Valid workspace type ("personal" or "business") is required.' });
  }

  const { type, name } = parse.data;
  const userId = req.user!.id;
  const now = new Date().toISOString();
  const workspaceId = `ws_${uuidv4().replace(/-/g, '').slice(0, 16)}`;

  const defaultName = type === 'personal' ? 'Personal Finances' : name || 'My Business';

  await db.insert(workspaces).values({
    id: workspaceId,
    type,
    name: defaultName,
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    ownerId: userId,
    onboardingStatus: 'in_progress',
    onboardingStep: type === 'personal' ? 'p1' : 'b1',
    createdAt: now,
    updatedAt: now
  });

  await db.insert(workspaceMembers).values({
    id: `mem_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
    workspaceId,
    userId,
    role: 'owner',
    createdAt: now
  });

  if (type === 'business') {
    await db.insert(businessProfiles).values({
      id: `bp_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
      workspaceId,
      legalName: defaultName,
      businessType: 'Retail',
      salesEntryMode: 'daily',
      createdAt: now,
      updatedAt: now
    });
  }

  // Set as user's active workspace
  await db.update(users).set({ activeWorkspaceId: workspaceId }).where(eq(users.id, userId));

  res.status(201).json({
    workspace: {
      id: workspaceId,
      type,
      name: defaultName,
      onboardingStatus: 'in_progress',
      onboardingStep: type === 'personal' ? 'p1' : 'b1'
    }
  });
});

apiV1Router.post('/me/active-workspace', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId } = req.body;
  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  // Verify membership
  const member = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, req.user!.id)));

  if (member.length === 0) {
    return res.status(403).json({ error: 'You are not a member of this workspace.' });
  }

  await db.update(users).set({ activeWorkspaceId: workspaceId }).where(eq(users.id, req.user!.id));

  const wsRows = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));
  res.json({ success: true, activeWorkspace: wsRows[0] });
});

// ==========================================
// 3. ONBOARDING STEP PERSISTENCE & COMPLETION
// ==========================================

apiV1Router.patch('/workspaces/:id/onboarding', requireAuth, requireWorkspaceMember(['owner']), async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.params.id;
  const { stepKey, nextStepKey, payload = {}, skipped = false } = req.body;

  if (!stepKey) {
    return res.status(400).json({ error: 'stepKey is required' });
  }

  const now = new Date().toISOString();

  // Save or update onboarding answer
  const existingAnswers = await db
    .select()
    .from(onboardingAnswers)
    .where(and(eq(onboardingAnswers.workspaceId, workspaceId), eq(onboardingAnswers.stepKey, stepKey)));

  if (existingAnswers.length > 0) {
    await db
      .update(onboardingAnswers)
      .set({
        payloadJson: JSON.stringify(payload),
        skipped: skipped ? 1 : 0,
        completedAt: now
      })
      .where(eq(onboardingAnswers.id, existingAnswers[0].id));
  } else {
    await db.insert(onboardingAnswers).values({
      id: `ans_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
      workspaceId,
      stepKey,
      payloadJson: JSON.stringify(payload),
      completedAt: now,
      skipped: skipped ? 1 : 0
    });
  }

  // Update business profile or user profile if relevant
  if (stepKey === 'p1') {
    // About you
    const { occupation, financialFocus } = payload;
    await db
      .update(userProfiles)
      .set({
        occupation: occupation || null,
        financialFocus: financialFocus ? JSON.stringify(financialFocus) : null,
        incomeRegularity: ['Freelancer', 'Entrepreneur'].includes(occupation) ? 'irregular' : 'regular',
        updatedAt: now
      })
      .where(eq(userProfiles.userId, req.user!.id));
  } else if (stepKey === 'b1') {
    // About business
    const { businessName, businessType, currentTrackingMethod } = payload;
    if (businessName) {
      await db.update(workspaces).set({ name: businessName }).where(eq(workspaces.id, workspaceId));
    }

    const featureProfile = JSON.stringify({
      inventory: !['Services', 'Professional Services'].includes(businessType),
      customers: true,
      suppliers: true
    });

    await db
      .update(businessProfiles)
      .set({
        legalName: businessName || 'My Business',
        businessType: businessType || 'Retail',
        currentTrackingMethod: currentTrackingMethod || 'Notebook',
        featureProfile,
        updatedAt: now
      })
      .where(eq(businessProfiles.workspaceId, workspaceId));
  } else if (stepKey === 'b3') {
    // Sales entry mode
    const { salesEntryMode = 'daily' } = payload;
    await db
      .update(businessProfiles)
      .set({ salesEntryMode, updatedAt: now })
      .where(eq(businessProfiles.workspaceId, workspaceId));
  }

  // Advance step on workspace
  const stepToSet = nextStepKey || stepKey;
  await db
    .update(workspaces)
    .set({
      onboardingStep: stepToSet,
      onboardingStatus: 'in_progress',
      updatedAt: now
    })
    .where(eq(workspaces.id, workspaceId));

  res.json({
    success: true,
    stepKey,
    nextStepKey: stepToSet,
    message: 'Onboarding progress saved successfully.'
  });
});

apiV1Router.post('/workspaces/:id/onboarding/complete', requireAuth, requireWorkspaceMember(['owner']), async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.params.id;
  const now = new Date().toISOString();

  // Load workspace & all answers
  const wsRows = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));
  if (wsRows.length === 0) {
    return res.status(404).json({ error: 'Workspace not found.' });
  }
  const ws = wsRows[0];

  const answers = await db.select().from(onboardingAnswers).where(eq(onboardingAnswers.workspaceId, workspaceId));
  const answerMap: Record<string, any> = {};
  for (const a of answers) {
    try {
      answerMap[a.stepKey] = JSON.parse(a.payloadJson);
    } catch {
      answerMap[a.stepKey] = {};
    }
  }

  // ========================================================
  // CONVERT STARTING FIGURES INTO REAL LEDGER DATA (Section 7)
  // ========================================================
  if (ws.type === 'personal') {
    const p2 = answerMap['p2'] || {};
    const currentSavings = Number(p2.currentSavings) || 0;
    const currentInvestments = Number(p2.currentInvestments) || 0;
    const monthlyIncome = Number(p2.monthlyIncome) || 0;
    const monthlyExpenses = Number(p2.monthlyExpenses) || 0;

    // 1. Current savings -> create Savings Account with opening_balance_minor
    if (currentSavings > 0) {
      const savingsAccId = `acc_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
      const minor = Math.round(currentSavings * 100);
      await db.insert(accounts).values({
        id: savingsAccId,
        workspaceId,
        type: 'savings',
        institution: 'Savings Vault',
        name: 'Personal Savings Vault',
        openingBalanceMinor: minor,
        currentBalanceMinor: minor,
        availableBalanceMinor: minor,
        currency: 'NGN',
        createdAt: now,
        updatedAt: now
      });
    }

    // 2. Current investments -> create Investment Account
    if (currentInvestments > 0) {
      const investAccId = `acc_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
      const minor = Math.round(currentInvestments * 100);
      await db.insert(accounts).values({
        id: investAccId,
        type: 'investment',
        institution: 'Investment Portfolio',
        name: 'Existing Investments',
        openingBalanceMinor: minor,
        currentBalanceMinor: minor,
        availableBalanceMinor: minor,
        currency: 'NGN',
        workspaceId,
        createdAt: now,
        updatedAt: now
      });
    }

    // 3. Expected monthly income and expenses -> stored on profile
    await db
      .update(userProfiles)
      .set({
        expectedMonthlyIncomeMinor: monthlyIncome > 0 ? Math.round(monthlyIncome * 100) : null,
        expectedMonthlyExpensesMinor: monthlyExpenses > 0 ? Math.round(monthlyExpenses * 100) : null,
        updatedAt: now
      })
      .where(eq(userProfiles.userId, req.user!.id));

    // 4. Initial Goal from P3
    const p3 = answerMap['p3'] || {};
    if (p3.name && Number(p3.targetAmount) > 0) {
      await db.insert(goals).values({
        id: `goal_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
        workspaceId,
        name: p3.name,
        category: p3.category || 'Savings',
        targetAmountMinor: Math.round(Number(p3.targetAmount) * 100),
        currentAmountMinor: 0,
        targetDate: p3.targetDate || '2027-12-31',
        iconName: p3.iconName || 'Target',
        status: 'active',
        createdAt: now,
        updatedAt: now
      });
    }
  } else if (ws.type === 'business') {
    const b2 = answerMap['b2'] || {};
    const cashBalance = Number(b2.currentCashBalance) || 0;
    const businessSavings = Number(b2.currentBusinessSavings) || 0;
    const monthlySales = Number(b2.averageMonthlySales) || 0;
    const monthlyExpenses = Number(b2.averageMonthlyExpenses) || 0;

    // 1. Current cash balance -> create Cash/Bank account
    if (cashBalance > 0) {
      const cashAccId = `acc_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
      const minor = Math.round(cashBalance * 100);
      await db.insert(accounts).values({
        id: cashAccId,
        workspaceId,
        type: 'cash',
        institution: 'Cash Drawer / Bank',
        name: 'Operating Cash',
        openingBalanceMinor: minor,
        currentBalanceMinor: minor,
        availableBalanceMinor: minor,
        currency: 'NGN',
        createdAt: now,
        updatedAt: now
      });
    }

    // 2. Business savings -> create business savings account
    if (businessSavings > 0) {
      const saveAccId = `acc_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
      const minor = Math.round(businessSavings * 100);
      await db.insert(accounts).values({
        id: saveAccId,
        workspaceId,
        type: 'savings',
        institution: 'Business Reserve',
        name: 'Business Reserves',
        openingBalanceMinor: minor,
        currentBalanceMinor: minor,
        availableBalanceMinor: minor,
        currency: 'NGN',
        createdAt: now,
        updatedAt: now
      });
    }

    // 3. Expectations stored on business profile
    await db
      .update(businessProfiles)
      .set({
        expectedMonthlySalesMinor: monthlySales > 0 ? Math.round(monthlySales * 100) : null,
        expectedMonthlyExpensesMinor: monthlyExpenses > 0 ? Math.round(monthlyExpenses * 100) : null,
        updatedAt: now
      })
      .where(eq(businessProfiles.workspaceId, workspaceId));
  }

  // Mark onboarding complete
  await db
    .update(workspaces)
    .set({
      onboardingStatus: 'completed',
      onboardingStep: 'done',
      updatedAt: now
    })
    .where(eq(workspaces.id, workspaceId));

  // Set as user's active workspace
  await db.update(users).set({ activeWorkspaceId: workspaceId }).where(eq(users.id, req.user!.id));

  res.json({
    success: true,
    redirectUrl: ws.type === 'personal' ? '/app/personal/overview' : '/app/business/overview',
    workspace: {
      id: ws.id,
      type: ws.type,
      name: ws.name,
      onboardingStatus: 'completed'
    }
  });
});

// ==========================================
// 4. TYPE-SPECIFIC DASHBOARDS (Section 8)
// ==========================================

apiV1Router.get('/workspaces/:id/dashboard', requireAuth, requireWorkspaceMember(), async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.params.id;

  const wsRows = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));
  if (wsRows.length === 0) {
    return res.status(404).json({ error: 'Workspace not found.' });
  }
  const ws = wsRows[0];

  // If onboarding is incomplete, return 409
  if (ws.onboardingStatus !== 'completed') {
    return res.status(409).json({
      error: 'Onboarding incomplete',
      requiresOnboarding: true,
      step: ws.onboardingStep,
      type: ws.type
    });
  }

  const userRole = req.workspaceRole || 'viewer';

  // Cashier role visibility enforcement (Section 8.2)
  const isCashier = userRole === 'cashier';

  if (ws.type === 'personal') {
    // ------------------------------------
    // PERSONAL DASHBOARD COMPUTED METRICS
    // ------------------------------------
    // 1. Accounts & Total balance
    const accRows = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.workspaceId, workspaceId), eq(accounts.isArchived, 0)));

    const totalBalanceMinor = accRows.reduce((sum, a) => sum + (a.currentBalanceMinor || 0), 0);

    // 2. Transactions for this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthIso = startOfMonth.toISOString();

    const txRows = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.workspaceId, workspaceId), eq(transactions.status, 'posted')));

    // Actual income and expenses come only from transactions (not opening balances)
    const monthTx = txRows.filter(t => t.occurredAt >= startOfMonthIso && t.source !== 'opening_balance');

    let incomeMinor = 0;
    let expensesMinor = 0;
    const categorySpendingMap: Record<string, number> = {};

    for (const t of monthTx) {
      if (t.amountMinor > 0) {
        incomeMinor += t.amountMinor;
      } else {
        const absAmount = Math.abs(t.amountMinor);
        expensesMinor += absAmount;
        const cat = t.classification || 'Other';
        categorySpendingMap[cat] = (categorySpendingMap[cat] || 0) + absAmount;
      }
    }

    const savingsMinor = incomeMinor - expensesMinor;
    const savingsRate = incomeMinor > 0 ? Math.round((savingsMinor / incomeMinor) * 100) : 0;

    // Safe to spend calculation: (Total Liquid Balance - upcoming committed)
    const liquidBalance = accRows
      .filter(a => a.type === 'bank' || a.type === 'cash')
      .reduce((s, a) => s + a.currentBalanceMinor, 0);
    const safeToSpendMinor = Math.max(0, liquidBalance - Math.round(expensesMinor * 0.2));

    // Spending breakdown
    const spendingBreakdown = Object.entries(categorySpendingMap).map(([category, amountMinor]) => ({
      category,
      amountMinor,
      percentage: expensesMinor > 0 ? Math.round((amountMinor / expensesMinor) * 100) : 0
    }));

    // Goals
    const goalRows = await db.select().from(goals).where(eq(goals.workspaceId, workspaceId));

    // Profile expectations
    const profRows = await db.select().from(userProfiles).where(eq(userProfiles.userId, req.user!.id));
    const profile = profRows[0] || null;

    // Deterministic plain-language AI diagnostic
    let aiInsight = '';
    if (txRows.length === 0) {
      aiInsight = 'Add a few transactions and CashDeck will start spotting patterns in your spending.';
    } else if (expensesMinor > incomeMinor && incomeMinor > 0) {
      aiInsight = `Your spending this month exceeds your recorded income by ₦${((expensesMinor - incomeMinor) / 100).toLocaleString()}. Consider reviewing discretionary categories.`;
    } else if (savingsRate >= 20) {
      aiInsight = `Great discipline! You are currently saving ${savingsRate}% of your income this month.`;
    } else {
      aiInsight = `You have recorded ₦${(expensesMinor / 100).toLocaleString()} in spending this month across ${monthTx.length} transactions.`;
    }

    // Setup checklist state
    const checklist = [
      { id: 'add_account', label: 'Add a bank or cash account', completed: accRows.length > 0 },
      { id: 'first_tx', label: 'Record your first expense or income', completed: txRows.length > 0 },
      { id: 'create_goal', label: 'Create a financial goal', completed: goalRows.length > 0 }
    ];

    return res.json({
      type: 'personal',
      workspace: { id: ws.id, name: ws.name, currency: ws.currency },
      userRole,
      metrics: {
        totalBalanceMinor,
        incomeMinor,
        expensesMinor,
        savingsMinor,
        savingsRate,
        safeToSpendMinor
      },
      spendingBreakdown,
      goals: goalRows,
      accounts: accRows,
      recentTransactions: txRows.slice(0, 10),
      aiInsight,
      checklist,
      profileExpectations: {
        expectedMonthlyIncomeMinor: profile?.expectedMonthlyIncomeMinor || null,
        expectedMonthlyExpensesMinor: profile?.expectedMonthlyExpensesMinor || null
      }
    });
  } else {
    // ------------------------------------
    // BUSINESS DASHBOARD COMPUTED METRICS
    // ------------------------------------
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    // Load business profile
    const bpRows = await db.select().from(businessProfiles).where(eq(businessProfiles.workspaceId, workspaceId));
    const bp = bpRows[0] || { salesEntryMode: 'daily', featureProfile: '{"inventory":true}' };

    // 1. Daily sales entries
    const dailyEntries = await db
      .select()
      .from(dailySalesEntries)
      .where(eq(dailySalesEntries.workspaceId, workspaceId))
      .orderBy(desc(dailySalesEntries.date));

    // Today's sales
    const todayEntry = dailyEntries.find(d => d.date === today) || null;
    const todaySalesMinor = todayEntry ? todayEntry.totalSalesMinor : 0;

    // Monthly revenue from daily sales
    const monthDailySales = dailyEntries.filter(d => d.date >= startOfMonthStr);
    const monthSalesFromDailyMinor = monthDailySales.reduce((s, d) => s + d.totalSalesMinor, 0);

    // Business expenses from transactions
    const txRows = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.workspaceId, workspaceId), eq(transactions.status, 'posted')));

    const monthTx = txRows.filter(t => t.occurredAt >= startOfMonth.toISOString() && t.source !== 'opening_balance');

    let monthExpensesMinor = 0;
    const expenseBreakdownMap: Record<string, number> = {
      Inventory: 0,
      Staff: 0,
      Rent: 0,
      Utilities: 0,
      Other: 0
    };

    for (const t of monthTx) {
      if (t.amountMinor < 0) {
        const absVal = Math.abs(t.amountMinor);
        monthExpensesMinor += absVal;
        const cat = t.classification || 'Other';
        if (expenseBreakdownMap[cat] !== undefined) {
          expenseBreakdownMap[cat] += absVal;
        } else {
          expenseBreakdownMap['Other'] += absVal;
        }
      }
    }

    // Revenue, Profit, Margin
    const totalRevenueMinor = monthSalesFromDailyMinor;
    const profitMinor = totalRevenueMinor - monthExpensesMinor;
    const profitMargin = totalRevenueMinor > 0 ? Math.round((profitMinor / totalRevenueMinor) * 100) : null;

    // Cash flow
    const cashInMinor = monthDailySales.reduce((s, d) => s + d.totalSalesMinor, 0);
    const cashOutMinor = monthExpensesMinor;
    const netCashFlowMinor = cashInMinor - cashOutMinor;

    // Accounts
    const accRows = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.workspaceId, workspaceId), eq(accounts.isArchived, 0)));

    // AI Business intelligence
    let aiInsight = '';
    if (dailyEntries.length === 0 && txRows.length === 0) {
      aiInsight = 'Record your first daily sales figure to start seeing real business intelligence.';
    } else if (monthExpensesMinor > totalRevenueMinor && totalRevenueMinor > 0) {
      aiInsight = 'Operating expenses currently exceed sales for this month. Review your procurement and staff expenses.';
    } else if (profitMargin && profitMargin > 25) {
      aiInsight = `Strong performance! Your business is maintaining a healthy ${profitMargin}% net margin this month.`;
    } else {
      aiInsight = `You have recorded ₦${(totalRevenueMinor / 100).toLocaleString()} in revenue across ${dailyEntries.length} sales days.`;
    }

    // Needs attention checklist
    const needsAttention: string[] = [];
    if (!todayEntry) {
      needsAttention.push("You haven't recorded sales for today yet.");
    }

    // Setup checklist state
    const checklist = [
      { id: 'first_sale', label: "Record your first day's sales", completed: dailyEntries.length > 0 },
      { id: 'add_expense', label: 'Record a business expense', completed: monthExpensesMinor > 0 },
      { id: 'connect_account', label: 'Add an operating bank or cash drawer', completed: accRows.length > 0 }
    ];

    // If Cashier role, censor profit & margins (Section 8.2)
    return res.json({
      type: 'business',
      workspace: { id: ws.id, name: ws.name, currency: ws.currency },
      userRole,
      salesEntryMode: bp.salesEntryMode,
      featureProfile: typeof bp.featureProfile === 'string' ? JSON.parse(bp.featureProfile) : bp.featureProfile,
      metrics: {
        todaySalesMinor,
        revenueMinor: isCashier ? null : totalRevenueMinor,
        expensesMinor: isCashier ? null : monthExpensesMinor,
        profitMinor: isCashier ? null : profitMinor,
        profitMargin: isCashier ? null : profitMargin,
        cashFlow: {
          cashInMinor,
          cashOutMinor: isCashier ? null : cashOutMinor,
          netCashFlowMinor: isCashier ? null : netCashFlowMinor,
          owedToYouMinor: 0
        }
      },
      todaySalesEntry: todayEntry,
      recentDailyEntries: dailyEntries.slice(0, 14),
      expenseBreakdown: isCashier ? {} : expenseBreakdownMap,
      aiInsight,
      needsAttention,
      checklist,
      accounts: accRows
    });
  }
});

// ==========================================
// 5. DAILY SALES ENTRIES (Section 9)
// ==========================================

const dailySalesSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  totalSalesMinor: z.number().int().nonnegative('Sales total must be non-negative integer in kobo'),
  cashMinor: z.number().int().nonnegative().optional().default(0),
  transferMinor: z.number().int().nonnegative().optional().default(0),
  posMinor: z.number().int().nonnegative().optional().default(0),
  otherMinor: z.number().int().nonnegative().optional().default(0),
  transactionCount: z.number().int().nonnegative().optional(),
  notes: z.string().optional()
});

apiV1Router.post('/workspaces/:id/daily-sales', requireAuth, requireWorkspaceMember(['owner', 'manager', 'cashier']), async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.params.id;
  const parse = dailySalesSchema.safeParse(req.body);

  if (!parse.success) {
    return res.status(400).json({ error: parse.error.issues[0]?.message || 'Invalid daily sales data' });
  }

  const { date, totalSalesMinor, cashMinor, transferMinor, posMinor, otherMinor, transactionCount, notes } = parse.data;

  // Validate breakdown sum matches total
  const breakdownSum = cashMinor + transferMinor + posMinor + otherMinor;
  if (breakdownSum > 0 && breakdownSum !== totalSalesMinor) {
    return res.status(400).json({
      error: `Payment method breakdown (₦${(breakdownSum / 100).toLocaleString()}) does not match total sales (₦${(totalSalesMinor / 100).toLocaleString()}).`
    });
  }

  const now = new Date().toISOString();

  // Check if an entry for this date already exists
  const existing = await db
    .select()
    .from(dailySalesEntries)
    .where(and(eq(dailySalesEntries.workspaceId, workspaceId), eq(dailySalesEntries.date, date)));

  let entryId: string;

  if (existing.length > 0) {
    // Edit existing entry with immutable audit event
    entryId = existing[0].id;
    let history: any[] = [];
    try {
      history = JSON.parse(existing[0].historyJson);
    } catch {
      history = [];
    }

    history.push({
      previousTotal: existing[0].totalSalesMinor,
      editedBy: req.user!.id,
      editedAt: now
    });

    await db
      .update(dailySalesEntries)
      .set({
        totalSalesMinor,
        cashMinor,
        transferMinor,
        posMinor,
        otherMinor,
        transactionCount: transactionCount ?? existing[0].transactionCount,
        notes: notes ?? existing[0].notes,
        historyJson: JSON.stringify(history),
        updatedAt: now
      })
      .where(eq(dailySalesEntries.id, entryId));

    await db.insert(auditLogs).values({
      id: `aud_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
      workspaceId,
      actorId: req.user!.id,
      action: 'daily_sales.updated',
      entity: 'daily_sales',
      entityId: entryId,
      beforeSnapshot: JSON.stringify(existing[0]),
      afterSnapshot: JSON.stringify({ totalSalesMinor, date }),
      ip: req.ip,
      createdAt: now
    });
  } else {
    // Create new daily sales entry
    entryId = `ds_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    await db.insert(dailySalesEntries).values({
      id: entryId,
      workspaceId,
      date,
      totalSalesMinor,
      cashMinor,
      transferMinor,
      posMinor,
      otherMinor,
      transactionCount: transactionCount ?? null,
      notes: notes ?? null,
      createdBy: req.user!.id,
      historyJson: '[]',
      createdAt: now,
      updatedAt: now
    });

    await db.insert(auditLogs).values({
      id: `aud_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
      workspaceId,
      actorId: req.user!.id,
      action: 'daily_sales.created',
      entity: 'daily_sales',
      entityId: entryId,
      afterSnapshot: JSON.stringify({ totalSalesMinor, date }),
      ip: req.ip,
      createdAt: now
    });
  }

  res.status(201).json({
    success: true,
    entry: {
      id: entryId,
      workspaceId,
      date,
      totalSalesMinor,
      cashMinor,
      transferMinor,
      posMinor,
      otherMinor,
      transactionCount,
      notes
    }
  });
});
