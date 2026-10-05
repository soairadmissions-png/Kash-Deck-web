import crypto from 'crypto';

interface VerificationCodeEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP code store with TTL cleanup
const emailCodes = new Map<string, VerificationCodeEntry>();
const phoneCodes = new Map<string, VerificationCodeEntry>();
const resetCodes = new Map<string, VerificationCodeEntry>();

export function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeResetCode(identifier: string, code: string, ttlMs = 15 * 60 * 1000): void {
  resetCodes.set(identifier.toLowerCase().trim(), {
    code,
    expiresAt: Date.now() + ttlMs,
    attempts: 0
  });
  console.log(`[CashDeck Auth] PASSWORD RESET CODE for ${identifier}: ${code}`);
}

export function verifyResetCode(identifier: string, inputCode: string): { success: boolean; error?: string } {
  const entry = resetCodes.get(identifier.toLowerCase().trim());
  if (!entry) {
    return { success: false, error: 'No reset code found. Please request a new code.' };
  }
  if (Date.now() > entry.expiresAt) {
    resetCodes.delete(identifier.toLowerCase().trim());
    return { success: false, error: 'Reset code expired. Please request a new code.' };
  }
  if (entry.attempts >= 5) {
    resetCodes.delete(identifier.toLowerCase().trim());
    return { success: false, error: 'Too many attempts. Request a new reset code.' };
  }

  if (entry.code.trim() !== inputCode.trim()) {
    entry.attempts++;
    return { success: false, error: 'Incorrect verification code. Please check and try again.' };
  }

  // Keep it valid briefly for password change or consume
  return { success: true };
}

export function consumeResetCode(identifier: string): void {
  resetCodes.delete(identifier.toLowerCase().trim());
}

export function storeEmailCode(email: string, code: string, ttlMs = 15 * 60 * 1000): void {
  emailCodes.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + ttlMs,
    attempts: 0
  });
  console.log(`[CashDeck Auth] EMAIL VERIFICATION CODE for ${email}: ${code}`);
}

export function verifyEmailCode(email: string, inputCode: string): { success: boolean; error?: string } {
  const cleanEmail = email.toLowerCase().trim();
  const cleanInput = inputCode.trim();

  const entry = emailCodes.get(cleanEmail);
  if (!entry) {
    return { success: false, error: 'No verification code found. Please request a new code.' };
  }
  if (Date.now() > entry.expiresAt) {
    emailCodes.delete(cleanEmail);
    return { success: false, error: 'Verification code has expired. Please request a new one.' };
  }
  if (entry.attempts >= 5) {
    emailCodes.delete(cleanEmail);
    return { success: false, error: 'Too many incorrect attempts. Please request a new code.' };
  }

  if (entry.code.trim() !== cleanInput) {
    entry.attempts++;
    return { success: false, error: 'Incorrect verification code. Please try again.' };
  }

  emailCodes.delete(cleanEmail);
  return { success: true };
}

export function storePhoneCode(phone: string, code: string, ttlMs = 15 * 60 * 1000): void {
  phoneCodes.set(phone.trim(), {
    code,
    expiresAt: Date.now() + ttlMs,
    attempts: 0
  });
  console.log(`[CashDeck SMS Adapter: console] OTP to ${phone}: Your CashDeck verification code is ${code}`);
}

export function verifyPhoneCode(phone: string, inputCode: string): { success: boolean; error?: string } {
  const entry = phoneCodes.get(phone.trim());
  if (!entry) {
    return { success: false, error: 'No verification code found for this phone number.' };
  }
  if (Date.now() > entry.expiresAt) {
    phoneCodes.delete(phone.trim());
    return { success: false, error: 'Verification code expired.' };
  }
  if (entry.attempts >= 5) {
    phoneCodes.delete(phone.trim());
    return { success: false, error: 'Too many attempts. Request a new code.' };
  }

  if (entry.code.trim() !== inputCode.trim()) {
    entry.attempts++;
    return { success: false, error: 'Incorrect code.' };
  }

  phoneCodes.delete(phone.trim());
  return { success: true };
}
