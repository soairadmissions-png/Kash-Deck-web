# CashDeck — Financial Command Center for Nigeria

CashDeck is a production-grade personal and business financial operating system designed for individuals and SMEs in Nigeria.

It provides automated ledger management, multi-account aggregation, invoice-to-cash reconciliation, deterministic metrics reporting, and an AI financial assistant.

## Onboarding & Workspace Experience Architecture

CashDeck provides a guided onboarding journey that branches into two fundamentally distinct operating environments based on user intent:

```
WELCOME (/welcome)
   ↓
CREATE ACCOUNT (/signup) / SIGN IN (/login)
   ↓
VERIFY ACCOUNT (/verify) (Email code & Phone OTP)
   ↓
WELCOME TO CASHDECK (/onboarding/welcome)
   ↓
CHOOSE YOUR CASHDECK (/onboarding/choose) → Personal | Business
   ↓                                            ↓
PERSONAL ONBOARDING                      BUSINESS ONBOARDING
 P1 About you (/onboarding/personal/p1)   B1 About business (/onboarding/business/b1)
 P2 Starting point (p2)                   B2 Starting numbers (b2)
 P3 First goal (p3)                       B3 Sales tracking mode (b3: Daily vs Itemized)
 P4 Ready summary (p4)                    B4 Ready summary (b4)
   ↓                                            ↓
PERSONAL DASHBOARD (/app/personal/overview) BUSINESS DASHBOARD (/app/business/overview)
```

### Routing Contract

| User State | Destination |
|---|---|
| Unauthenticated | `/welcome` → `/signup` or `/login` |
| Authenticated, unverified | `/verify` |
| Verified, no workspace | `/onboarding/welcome` → `/onboarding/choose` |
| Incomplete onboarding | Resume at saved step (`p1`–`p4` or `b1`–`b4`) |
| Completed Personal workspace | `/app/personal/overview` (Personal navigation & terminology) |
| Completed Business workspace | `/app/business/overview` (Business navigation & Daily Sales) |

### Key Invariants

1. **Integer Minor Units (Kobo)**: All monetary amounts stored as integers in kobo (never floating point).
2. **Real Ledger Records**: Starting savings and operating cash initialize real account ledger records with `opening_balance_minor`. Opening balances are never counted as revenue or income.
3. **Daily Sales Engine**: Business owners can record one aggregate sales total at the end of each day with optional method breakdown (Cash / Transfer / POS).
4. **Workspace Isolation**: Users can own both Personal and Business workspaces. The workspace switcher flips the entire shell without data leakage.
5. **No Demo Hallucination**: Brand-new users see honest, actionable empty states and setup checklists.

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, TanStack Query, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript.
- **Database**: PostgreSQL (embedded PGlite locally for zero-setup local dev; external Postgres supported via `DATABASE_URL`) with Drizzle ORM.
- **Authentication**: JWT access + rotating refresh tokens in httpOnly cookies, password hashing with bcrypt, TOTP 2FA, session revocation.
- **AI Engine**: Google Gemini API via `@google/genai` (server-side function calling only).

## Getting Started

### Prerequisites

- Node.js >= 20.x

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd cashdeck

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start the development server (runs backend and Vite frontend on port 3000)
npm run dev
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```
