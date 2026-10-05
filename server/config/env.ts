import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_URL: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().optional(),
  DB_STORAGE_DIR: z.string().default('./data/cashdeck.db'),

  // Auth & Sessions
  JWT_ACCESS_SECRET: z.string().min(16).default('cashdeck_dev_access_secret_min16chars!'),
  JWT_REFRESH_SECRET: z.string().min(16).default('cashdeck_dev_refresh_secret_min16chars!'),
  SESSION_COOKIE_SECRET: z.string().min(16).default('cashdeck_dev_cookie_secret_min16chars!'),

  // AI & Services
  GEMINI_API_KEY: z.string().optional(),

  // Payments
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_PUBLIC_KEY: z.string().optional(),
  PAYSTACK_WEBHOOK_SECRET: z.string().optional(),

  // Notification / SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().default('notifications@cashdeck.ng'),
  SMS_PROVIDER: z.enum(['console', 'termii', 'twilio']).default('console'),

  // Security & Flags
  ENABLE_DEV_ROUTES: z
    .string()
    .default('false')
    .transform(v => v === 'true'),
  ENABLE_DEMO_SEED: z
    .string()
    .default('true')
    .transform(v => v !== 'false')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[CashDeck Config] Invalid environment configuration:');
  console.error(parsed.error.format());
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const env = parsed.success ? parsed.data : envSchema.parse({});
