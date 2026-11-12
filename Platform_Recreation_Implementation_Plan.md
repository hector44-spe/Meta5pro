# Complete Implementation Plan: Full-Stack Multi-Asset Broker Platform

This plan outlines the complete engineering blueprint for building a unified, multi-asset trading and investment broker platform. It recreates the visual design system extracted from `metagold.html` (true black `#000000`, card slate `#0F0F0F`, accent cyan `#31ACEE`, emerald profit `#01B28B`) across **all public marketing pages** and seamlessly extends that design into the **authenticated investor dashboard, crypto wallet, and admin portal**.

---

## 1. System Architecture & Route Map

```
                                  [ PLATFORM GATEWAY ]
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼                                                                   ▼
  [ PUBLIC STATIC PAGES ]                                         [ AUTHENTICATED DYNAMIC APP ]
  (Shared Master Header & Footer)                                 (Protected by JWT / Session)
  ├── 1. Landing Page (/)                                         ├── 11. Login (/login)
  ├── 2. Staking (/staking)                                       ├── 12. Register (/register)
  ├── 3. Markets (/markets)                                       ├── 13. Investor Dashboard (/dashboard)
  ├── 4. Crypto Trading (/crypto)                                 ├── 14. Wallet Hub (/wallet)
  ├── 5. Stocks & ETFs (/stocks)                                  │       ├── Deposit (USDT/BTC + QR)
  ├── 6. Copy Trading (/copy-trading)                             │       └── Withdrawal Portal
  ├── 7. Real Estate (/real-estate)                               ├── 15. Staking Manager (/dashboard/staking)
  ├── 8. About Us (/about)                                        ├── 16. Profile & Security (/dashboard/profile)
  ├── 9. Contact & Support (/contact)                             └── 17. Super Admin Portal (/admin)
  └── 10. Legal (/terms, /privacy)                                        ├── Deposit Approvals
                                                                          ├── User Balance Editor
                                                                          └── Forensic Audit Logs
```

---

## 2. Shared Design System (`styles/globals.css`)

All 17 pages share one centralized design system extracted directly from the root design tokens:

### Color Palette & Tokens
* **Background Canvas:** `--background: #000000;`
* **Card Surface:** `--color-card: #0F0F0F;`
* **Card Border Outline:** `--color-outline: rgba(190, 167, 255, 0.12);`
* **Primary Brand Accent:** `--color-accent: #31ACEE;` (Cyan)
* **Positive / Profit Green:** `--color-positive: #01B28B;`
* **Negative / Loss Red:** `--color-negative: #FF3344;`
* **Text Primary:** `--color-text-primary: #FCFCFC;`
* **Text Muted / Subtitle:** `--color-text-tertiary: #BABCD2;`
* **Typography:** `font-family: 'Inter', -apple-system, sans-serif;`

---

## 3. Detailed Page Specifications

### A. Public Marketing Pages (10 Pages)

Each public page reuses the **Master Header** (logo, nav links, Login/Sign Up buttons) and **Master Footer** (4-column link directory, risk disclaimer, copyright):

| # | Page Route | Layout & Key Components |
|---|---|---|
| **1** | **Landing (`/`)** | Hero section with animated live market ticker (TradingView), 3D grid backlight, 4 feature cards, omni-market carousel, security compliance stats, customer testimonials. |
| **2** | **Staking (`/staking`)** | Yield calculators (slider to calculate estimated returns based on deposit size and duration), APY tiers (e.g. 8% – 24% APY), lock-up term details. |
| **3** | **Markets (`/markets`)** | Live asset table with search/filter tabs (Crypto, Forex, Indices, Commodities), 24h change %, volume, and TradingView mini-sparklines. |
| **4** | **Crypto (`/crypto`)** | Major pairs (BTC/USD, ETH/USDT, SOL/USDT), leverage tier calculator, liquidity depth breakdown, cold-storage security explanation. |
| **5** | **Stocks & ETFs (`/stocks`)** | Blue-chip directory (Apple, Tesla, NVIDIA, SPY), zero-commission trading banner, market hours indicator. |
| **6** | **Copy Trading (`/copy-trading`)** | Leaderboard of top quants, win-rates (e.g. 91.4%), 30-day profit charts, "How Copytrading Works" 3-step diagram. |
| **7** | **Real Estate (`/real-estate`)** | Fractionalized property investment cards, rental yield distribution schedules, asset valuation breakdowns. |
| **8** | **About Us (`/about`)** | Executive mission statement, global office locations, infrastructure timeline, executive team profiles. |
| **9** | **Contact (`/contact`)** | Direct support ticket form, official email addresses, live chat bridge (WhatsApp / Telegram integration). |
| **10** | **Legal (`/terms`, `/privacy`)** | Regulatory disclosures, anti-money laundering (AML) policies, risk warnings, terms of service. |

---

### B. Authenticated Dynamic Application (7 Pages)

These pages connect directly to the **PostgreSQL database** and execute business logic:

#### 11 & 12. Authentication (`/login`, `/register`, `/forgot-password`)
* **Login:** Email/username and password fields with password reveal toggle, remember-me token, and error toast alerts.
* **Register:** Full name, email, phone number, password confirmation, referral code field, and terms acceptance checkbox.
* **Security:** Passwords encrypted using `bcrypt` (12 salt rounds); sessions managed via HTTP-only JWT cookies.

#### 13. Investor Dashboard Overview (`/dashboard`)
* **Balance Banner:**
  * **Total Equity:** Live sum of `mainBalance + interestBalance`.
  * **24h Profit / Yield:** Highlighted in green (`+$245.50 / +2.8%`).
  * **Active Investments Count:** Number of currently running packages.
* **Interactive Chart:** Embedded TradingView chart with timeframe selectors (1D, 1W, 1M, 1Y).
* **Quick Actions:** One-click shortcut buttons: **Deposit**, **Withdraw**, **Stake**, **Copy Trade**.
* **Recent Activity Feed:** Table displaying the last 5 transactions with live status badges.

#### 14. Wallet & Deposit / Withdrawal Center (`/wallet`)
* **Deposit Workflow:**
  1. User selects crypto currency: **USDT (TRC-20)**, **USDT (BEP-20)**, or **Bitcoin (BTC)**.
  2. Front-end dynamically generates the company's designated master deposit address and QR code.
  3. "Copy Address" one-click button with feedback notification.
  4. User enters transferred amount and pastes their **Transaction Hash (TxID)** with optional payment slip upload.
  5. Transaction is recorded in the database with status `PENDING`.
* **Withdrawal Workflow:**
  1. User enters withdrawal amount and destination crypto address.
  2. System checks available balance; applies an immediate concurrency lock to prevent double-spending.
  3. User confirms with 2FA or email OTP.
  4. Withdrawal enters the Admin queue with status `PENDING_APPROVAL`.

#### 15. Staking & Copytrade Manager (`/dashboard/staking`)
* Displays currently subscribed packages with active countdown timers (`X days remaining`).
* "Subscribe New Plan" modal allowing users to allocate funds from their `mainBalance`.

#### 16. Profile & Security Center (`/dashboard/profile`)
* Update contact information and change password.
* Enable Two-Factor Authentication (TOTP via Google Authenticator).
* KYC Document Upload (NIN, National ID, or Passport).

#### 17. Super Admin Control Center (`/admin`)
* **Transaction Moderation Queue:** List of all pending deposits and withdrawals. One-click **Approve** (credits user balance) or **Reject** (refunds hold with explanation).
* **User Management Table:** Search, view, edit balances, or freeze accounts.
* **Plan Configurator:** Modify ROI percentages, plan durations, and minimum deposit limits.
* **System Audit Log:** Immutable chronological table logging all logins, approvals, and IP addresses.

---

## 4. Database Schema (PostgreSQL + Prisma ORM)

```prisma
// Core User Account
model User {
  id           String       @id @default(uuid())
  email        String       @unique
  username     String       @unique
  fullName     String?
  phoneNumber  String?
  passwordHash String
  role         UserRole     @default(INVESTOR) // INVESTOR, ADMIN
  status       UserStatus   @default(ACTIVE)   // ACTIVE, SUSPENDED
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  wallet       Wallet?
  investments  Investment[]
  transactions Transaction[]
  activityLogs ActivityLog[]
}

// User Financial Balances
model Wallet {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  mainBalance     Decimal  @default(0.00) @db.Decimal(18, 2)
  interestBalance Decimal  @default(0.00) @db.Decimal(18, 2)
  totalDeposited  Decimal  @default(0.00) @db.Decimal(18, 2)
  totalWithdrawn  Decimal  @default(0.00) @db.Decimal(18, 2)
  updatedAt       DateTime @updatedAt
}

// Pre-Configured Investment Packages
model Plan {
  id                 String       @id @default(uuid())
  name               String       // e.g., "Alpha Staking", "Quant Copytrade"
  minDeposit         Decimal      @db.Decimal(18, 2)
  maxDeposit         Decimal      @db.Decimal(18, 2)
  dailyRoiPercentage Decimal      @db.Decimal(5, 2) // e.g. 2.50%
  durationDays       Int          // e.g. 30 days
  capitalRefund      Boolean      @default(true)
  isActive           Boolean      @default(true)
  investments        Investment[]
}

// Active User Subscriptions
model Investment {
  id            String           @id @default(uuid())
  userId        String
  user          User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  planId        String
  plan          Plan             @relation(fields: [planId], references: [id])
  amount        Decimal          @db.Decimal(18, 2)
  accruedProfit Decimal          @default(0.00) @db.Decimal(18, 2)
  daysRemaining Int
  status        InvestmentStatus @default(RUNNING) // RUNNING, COMPLETED, CANCELLED
  lastPayoutAt  DateTime         @default(now())
  createdAt     DateTime         @default(now())
}

// Financial Ledger (Deposits, Withdrawals, Profits)
model Transaction {
  id            String            @id @default(uuid())
  userId        String
  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  type          TransactionType   // DEPOSIT, WITHDRAWAL, DAILY_ROI, CAPITAL_REFUND
  amount        Decimal           @db.Decimal(18, 2)
  currency      String            // USDT_TRC20, USDT_BEP20, BTC
  cryptoAddress String?
  txHash        String?
  receiptUrl    String?
  status        TransactionStatus @default(PENDING) // PENDING, APPROVED, REJECTED
  approvedAt    DateTime?
  createdAt     DateTime          @default(now())

  @@index([userId])
  @@index([status])
}

// Forensic Audit Ledger
model ActivityLog {
  id         String   @id @default(uuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  actionType String   // e.g. "USER_LOGIN", "DEPOSIT_REQUEST", "ADMIN_APPROVAL"
  ipAddress  String?
  metadata   Json?
  createdAt  DateTime @default(now())
}

enum UserRole {
  INVESTOR
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
}

enum InvestmentStatus {
  RUNNING
  COMPLETED
  CANCELLED
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  DAILY_ROI
  CAPITAL_REFUND
}

enum TransactionStatus {
  PENDING
  APPROVED
  REJECTED
}
```

---

## 5. Automated Daily Profit Engine (Cron Job)

A background worker (running every 24 hours at 00:00 UTC) automates earnings distribution:

```typescript
// Cron Worker: Daily ROI Distribution
export async function runDailyProfitCalculation() {
  const activeInvestments = await prisma.investment.findMany({
    where: { status: 'RUNNING', daysRemaining: { gt: 0 } },
    include: { plan: true, user: { include: { wallet: true } } }
  });

  for (const inv of activeInvestments) {
    const dailyReturn = (Number(inv.amount) * Number(inv.plan.dailyRoiPercentage)) / 100;

    await prisma.$transaction([
      // 1. Credit User's Interest Balance
      prisma.wallet.update({
        where: { userId: inv.userId },
        data: { interestBalance: { increment: dailyReturn } }
      }),
      // 2. Update Investment State
      prisma.investment.update({
        where: { id: inv.id },
        data: {
          accruedProfit: { increment: dailyReturn },
          daysRemaining: { decrement: 1 },
          lastPayoutAt: new Date(),
          status: inv.daysRemaining - 1 === 0 ? 'COMPLETED' : 'RUNNING'
        }
      }),
      // 3. Log Transaction
      prisma.transaction.create({
        data: {
          userId: inv.userId,
          type: 'DAILY_ROI',
          amount: dailyReturn,
          currency: 'USD',
          status: 'APPROVED'
        }
      })
    ]);
  }
}
```

---

## 6. Phased Implementation Timeline

| Phase | Deliverables | Duration |
| :--- | :--- | :--- |
| **Phase 1: Project Setup & Design System** | Scaffold repo, extract `styles/globals.css`, build Master Header & Footer components. | Week 1 |
| **Phase 2: Public Marketing Pages** | Construct all 10 public pages (`/`, `/staking`, `/markets`, `/crypto`, `/about`, etc.). | Week 2 |
| **Phase 3: Database & Authentication** | Setup PostgreSQL + Prisma, implement registration/login APIs, session security, password hashing. | Week 3 |
| **Phase 4: Investor Dashboard & Wallet** | Build `/dashboard`, TradingView chart integration, crypto deposit modal (USDT QR code + TxID uploader), withdrawal request form. | Week 4 |
| **Phase 5: Financial Automation & Admin** | Build Super Admin panel (`/admin`), one-click transaction approvals, balance editor, and 24-hr daily ROI cron job. | Week 5 |
| **Phase 6: Testing & Production Launch** | Concurrency testing (race-condition locks), SQL injection audits, domain mapping, SSL deployment. | Week 6 |
