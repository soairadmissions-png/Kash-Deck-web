import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  workspaceId?: string;
  role?: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m'
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Simple RFC 6238 TOTP validator using Node crypto (no extra binary dependencies)
export function generateTOTPSecret(): string {
  return crypto.randomBytes(20).toString('hex').slice(0, 32);
}

export function generateRecoveryCodes(): string[] {
  return Array.from({ length: 8 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 8)
  );
}

export function verifyTOTPCode(secret: string, code: string): boolean {
  if (!code || code.length !== 6) return false;
  // Verify standard 30-second window +/- 1 step
  const timeStep = Math.floor(Date.now() / 30000);
  for (let offset = -1; offset <= 1; offset++) {
    const counter = timeStep + offset;
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(counter));
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'hex')).update(buf).digest();
    const offsetByte = hmac[hmac.length - 1] & 0xf;
    const binary =
      ((hmac[offsetByte] & 0x7f) << 24) |
      ((hmac[offsetByte + 1] & 0xff) << 16) |
      ((hmac[offsetByte + 2] & 0xff) << 8) |
      (hmac[offsetByte + 3] & 0xff);
    const expected = (binary % 1000000).toString().padStart(6, '0');
    if (expected === code.trim()) return true;
  }
  return false;
}
