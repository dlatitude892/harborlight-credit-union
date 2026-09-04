# Harborlight Credit Union — Member Banking

A responsive, reactive full-stack rebuild of the original banking demo:
a hardened Express/TypeScript/MongoDB API and a React + TypeScript
frontend with a dark navy / steel-blue "passbook ledger" visual theme.

## What changed from the original project

**Backend**
- Fixed broken imports (`../models/User` pointed at a folder that didn't
  exist — everything was under `model/`, singular).
- Removed a duplicate/conflicting MongoDB connection in `server.ts`.
- Added `helmet`, scoped `cors`, request-size limits, and rate limiting
  on auth and money-movement endpoints (the `helmet` and
  `rate-limiter-flexible` packages were already dependencies but unused).
- Added Zod request validation and a centralized error handler instead
  of repeated try/catch blocks with inconsistent error shapes.
- Added a real `balance` field on `User` and made OTP-verified transfers
  atomic (`mongoose` session) so both sides of a transfer update
  together.
- Added `GET /api/accounts/summary` — the frontend dashboard needs real
  balance/income/expense numbers, not hardcoded placeholders.
- Typed `req.user` properly instead of `any`.

**Frontend**
- Replaced the static HTML dashboard (fake data, no interactivity)
  with a React + TypeScript app: real component state, a reactive
  `AuthContext`, live data fetched from the API, and client-side
  routing.
- Built a distinctive dark blue/gray design system from scratch —
  Fraunces (display) + Inter (body) + IBM Plex Mono (every dollar
  figure, tabular-aligned like a ledger), with a signature
  "ledger-rule" divider motif.
- Fully responsive: sidebar collapses into a mobile drawer, the
  transactions table reflows into stacked cards under 860px, and the
  auth screens drop their side panel on narrower viewports.

## Project structure

```
harborlight/
  backend/     Express + TypeScript + MongoDB API
  frontend/    React + TypeScript + Vite app
```

## Running it locally

### 1. Backend

```bash
cd backend
cp .env.example .env      # edit MONGODB_URI / JWT_SECRET as needed
npm install
npm run dev                # http://localhost:5000
```

Requires a running MongoDB instance (local, Docker, or Atlas) at the
URI in `.env`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # points at the backend above by default
npm install
npm run dev                 # http://localhost:5173
```

Open http://localhost:5173, register a member account, and you'll
land on the dashboard.

### Trying a transfer

Register two accounts in two browser tabs (or incognito), then from
one account go to **Transfers** and enter the other account's Mongo
`_id` as the recipient. No SMTP is configured by default, so the
6-digit verification code is shown directly in the UI (`devOtp`) —
in production, wire `nodemailer` (already a backend dependency) to
send it instead, and drop the `devOtp` field from the API response.

## Notes on going to production

- Set a long random `JWT_SECRET` and a real `MONGODB_URI`.
- Configure SMTP env vars and send the OTP by email/SMS instead of
  returning it in the API response.
- Put the API behind HTTPS; `helmet` and CORS are already configured,
  but cookies/session behavior should be revisited if you move off
  bearer tokens in `localStorage`.
- Swap `RateLimiterMemory` for `RateLimiterRedis` if you run more than
  one backend instance, since the in-memory limiter is per-process.

## New in this update

- **Homepage ↔ dashboard navigation** — the sidebar brand mark links back to the
  public homepage from anywhere in the app, and the homepage navbar shows a
  "Go to dashboard" button instead of Sign in/Register once you're logged in.
- **Real Accounts page** — member/account/routing numbers, live status, and a
  checking/savings share breakdown driven by your actual balance.
- **External transfers & bill pay** — Transfer now has two tabs: Harborlight
  member (as before) and External account. Add saved payees (bank account,
  Cash App, Zelle, Venmo, PayPal) on the new **Bills** page, then send to them
  from either Bills or Transfer. Every external send still goes through the
  same OTP verification as member transfers.
- **Cards page** — a real card visual (reveal/hide number, freeze toggle,
  spending-limit slider). A default debit card is issued automatically the
  first time a member opens the page.
- **Admin portal** at `/admin` — separate top nav from the member app, with:
  - **Overview**: member count, total balance across all members, pending
    transaction count, and a form to credit any member's account directly
    (applies funds immediately, no OTP - this is an administrative action).
  - **Pending transactions**: every transaction awaiting OTP/review, with
    **Approve** (moves the funds), **Hold** (parks it as pending), and
    **Block** (rejects it, only allowed before funds have moved) actions.

### Promoting a member to admin

There's intentionally no public "become an admin" flow. To make a member an
admin, update their user document directly, e.g. via `mongosh` or MongoDB
Compass:

```js
db.users.updateOne({ email: 'you@example.com' }, { $set: { role: 'ADMIN' } })
```

Once promoted, log out and back in (or refresh) - the sidebar will show an
"Admin portal" link, and `/admin` becomes accessible.

## New in this update (dashboard, send money, admin portal)

- **Profile header** — a clean white card at the top of the dashboard with a
  circular initials avatar, name, email, member number, and member-since date.
- **Removed the "Account in good standing" pill** from the top of every page.
- **Send Money** now has two modes:
  - Harborlight member (unchanged)
  - **Bank wire transfer** — a full form collecting receiver name/address,
    bank name/address, account number, routing number, and SWIFT/BIC. This
    posts to `POST /api/transactions/bank-transfer`, which creates a saved
    payee (only the last 4 of the account number are persisted) and an
    OTP-protected transaction in one step.
- **Pay Bills / P2P** is a redesigned page: four selectable service cards
  (Cash App, Zelle, Venmo, PayPal) with brand-styled badges. Selecting one
  reveals a service-specific form (recipient name + the right handle field
  for that service + amount + description), posting to
  `POST /api/transactions/p2p`. Recent recipients for the selected service
  appear as quick-select chips.
- **Admin portal**, expanded:
  - **Members** — search/browse all registered members, sorted newest first.
  - **Member profile** (`/admin/users/:id`) — balance, account number,
    member-since date, full transaction history, and one-click account
    status changes (Active / Frozen / Flagged / Blocked).
  - **Pending transactions** — Approve, Hold, Block, or Reject.
  - **Flagged activity** — accounts marked FLAGGED, transactions at or above
    $5,000, and any blocked/rejected transactions, all in one review screen.
  - **Audit log** — every admin action (credits, approvals, blocks,
    rejections, holds, unblocks, status changes) with which admin did it and
    when, backed by the `AuditLog` collection.

## Not yet built (large, separate initiatives)

Two feature specs were provided that go well beyond this update's scope and
deserve their own dedicated passes:

1. **Full homepage redesign** to a white/green visual theme, animated hero,
   four multi-step loan application flows (home, auto, personal, business),
   and a customer-care ticketing system with its own admin queue.
2. **Investment platform** — portfolio dashboard, stock browsing, buy/sell
   order flow, watchlists, recurring investments, KYC/investment-profile
   questionnaire, and investment transaction history.

Both are substantial enough that building them well means tackling one at a
time rather than bolting them on quickly. Let's schedule these next.

## Homepage redesign (white/green theme)

The public marketing site has been fully rebuilt to a white + green
"premium financial services" aesthetic, kept entirely separate from the
dashboard's dark theme via a new `src/marketing.css` file scoped under a
`.pub-site` wrapper class - the authenticated app's dark navy theme in
`index.css` is untouched.

- **New logo** - a "beacon" mark (rays radiating from a point, evoking the
  name "Harborlight") plus a two-line wordmark, used consistently across the
  header, footer, and now-restyled Login/Register pages.
- **Sticky header** with a scroll shadow, animated mobile menu, and nav
  items (Personal Banking, Loans, Mortgages, Business Banking, About Us,
  Contact) that scroll to homepage sections.
- **Hero section** using an abstract floating-card illustration (balance,
  savings rate, mobile deposit, loan pre-approval) rather than stock
  photography - real photos would need actual licensing, which isn't
  something that can be safely sourced for a site you'll deploy.
- **Quick features, About (with animated count-up stats), and Banking
  Experience** sections, all with scroll-reveal animations that respect
  `prefers-reduced-motion`.
- **Four loan sections** (Home, Auto, Personal, Business), each opening a
  real **5-step application wizard** (About You → Financial Information →
  Loan Details → Review → Submit) with fields tailored to that loan type,
  including a separate Mortgage Refinance flow. Submissions post to
  `POST /api/loan-applications` (no login required) and return a reference
  number.
- **Customer Care** section with a contact modal (name, email, phone,
  category, subject, message) posting to `POST /api/customer-care`.
- **Trust section, final CTA, and a multi-column footer** with working
  links to new **Privacy, Terms, Accessibility, and Security Center** pages.
- **Admin additions**: a **Loan applications** queue (status: New / In
  Review / Approved / Denied) and a **Customer care** ticket queue (status:
  New / In Progress / Waiting for Customer / Resolved / Closed) with
  assignment and a response thread - both under their own nav items in the
  admin portal, and both write to the audit log.

## Still outstanding

The **investment platform** spec (portfolio dashboard, stock browsing,
buy/sell orders, watchlists, recurring investments, KYC/investment-profile
questionnaire) has not been built yet - that's the next large initiative
whenever you're ready to start it.

## Account architecture, transaction approval, and admin compliance queue

**Product decision made together:** new accounts are usable immediately after
registration (login, transfers, cards all work right away) - compliance
review happens in parallel via the Account Applications admin queue, rather
than gating login behind approval. This preserves everything already built
(dashboard, transfers, cards) while still giving admins a real review
workflow. `accountStatus: 'CLOSED'` is the one status that does block login.

- **Checking Account** (`/checking`) is the core account every member has -
  same balance/account-number fields as before, now with its own dedicated
  page and a customer-facing notice banner when the account isn't Active.
- **Savings Account** (`/savings`) is a genuinely separate product a member
  opens explicitly. New `SavingsAccount` and `SavingsTransaction` models;
  `POST /api/savings/open` creates it, `POST /api/savings/transfer` moves
  money atomically between checking and savings.
- **Multi-step "Open an Account" flow** at `/register` - Personal Information
  → Address → Account & Security → Identity & Compliance → Review, ending in
  an account that's active immediately. **Security note:** only the last 4
  digits of an SSN and of a government ID number are ever collected or
  stored - same pattern already used for card and bank account numbers
  elsewhere in this app. A real production system would integrate a
  regulated identity-verification provider (Plaid Identity, Persona, Socure,
  etc.) rather than collecting SSNs through a plain form - what's built here
  is a compliance-tracking *simulation*, not a KYC-compliant pipeline.
- **Mandatory transaction approval workflow**: every transfer (member,
  external, bank wire, P2P) now goes `OTP_REQUIRED → OTP_VERIFIED (identity
  confirmed) → PENDING (awaiting admin) → APPROVED (funds move) /
  REJECTED / BLOCKED`. OTP verification no longer auto-completes a transfer -
  an administrator must explicitly approve it on the Pending Transactions
  screen. Admin credits (staff adding funds directly) are the one exception
  and still apply immediately, since that's inherently an admin action.
- **Account status set** changed to `ACTIVE | UNDER_REVIEW | RESTRICTED |
  FROZEN | CLOSED`, matching the spec. Two distinct note types on `User`:
  `customerNotice` (shown to the member on their dashboard) and `adminNotes`
  (an internal, admin-only thread - never exposed to the customer).
- **Admin portal** additions: **Applications** (compliance queue: Submitted /
  Under Review / Approved / Rejected / Requires Additional Info), and the
  Members detail page now shows both account balances (if savings exists),
  a customer-notice editor, and the internal notes thread.

Existing accounts in your database from before this update have the old
status values (`FROZEN`, `FLAGGED`, `BLOCKED`) - if any of your test users
have one of those, update them to a value from the new set
(`ACTIVE | UNDER_REVIEW | RESTRICTED | FROZEN | CLOSED`) directly in Atlas,
since `FLAGGED` and `BLOCKED` are no longer valid values going forward.

## Latest updates: wording, hold status, member ID transfers, admin editing, receipts, live chat

- **Customer-facing wording** no longer mentions "admin" — transfers now say
  "pending approval" throughout (OTP modal, success messages, transaction
  status labels), matching how a real bank would phrase it.
- **Hold now has its own status.** Previously "Hold" reused the same
  `PENDING` state a transaction starts in, so nothing visibly changed on the
  member's side. There's now a distinct `ON_HOLD` status with its own badge,
  and admins can "Release hold" to put it back in the review queue.
- **Fixed member-to-member transfers.** They previously required the
  recipient's internal database ID, which members have no way of knowing.
  Sending money to another member now uses their actual **Member ID** (the
  `HL-XXXXXXXXX` account number shown on their Checking Account page) -
  `POST /api/transactions` looks the recipient up by that number now.
- **Admin can edit and backdate.** A new "Edit" action on any transaction
  (from Pending Transactions or a member's transaction history) lets an
  admin change the amount, description, category, or date. If the
  transaction had already moved funds, changing the amount **retroactively
  adjusts the affected balance(s)** by the difference, atomically. A
  member's account creation date can also be backdated from their profile
  page. Both actions are captured in the audit log with before/after values.
- **Downloadable PDF receipts** - every transaction row now has a receipt
  icon that generates and downloads a branded PDF (reference, date, amount,
  parties, status) using `jsPDF`, entirely client-side.
- **Live chat** - a floating chat widget on every public/member page (not
  shown in the admin portal, which has its own inbox instead). Logged-in
  members are connected automatically; guests give their name first. Admins
  see a two-pane inbox (`/admin/chat`) to view and reply to conversations.
  **Scope note:** this uses short-interval polling (checks for new messages
  every ~4 seconds) rather than a full WebSocket push server - it works and
  feels close to real-time, but a true instant-push implementation would be
  a larger follow-up (Socket.IO or similar) if you want that later.
