# ETH Cannes Pay

> A crypto-native fintech app inspired by **Revolut** and **Venmo** – private, social, and Web3-native.

---

## Concept

ETH Cannes Pay lets users send and receive money via their crypto wallet with a strong duality:

| Mode | Description |
|------|-------------|
| **Public** | Transaction is on-chain and visible; appears in a social feed |
| **Private (UNILINK)** | Sender, recipient, and their relationship are hidden – full confidentiality |

Authentication is 100% Web3 via **WalletConnect** (no email, no password).

---

## Features

### Authentication
- Wallet-only login via signature challenge
- No email / no password
- ENS name resolution for human-readable identities

### Send money
- **Public mode** – transaction visible on-chain; recipient identifiable; appears in feed
- **Private mode (UNILINK)** – masks both identities and the relationship between parties

### Request money
- **One-time QR code** – generated for a specific transaction, expirable, single-use
- **Permanent QR code** – reusable address-linked code
- Both can be public or private

### Payment links
- Every user can generate a shareable link: `/pay/alice` or `/pay/alice/20`
- Can be public or private
- Amount can be fixed or open (payer decides)
- Compatible with mobile sharing (WhatsApp, etc.)
- Use cases: remote payments, creators, freelancers

### Transaction history
- **Public**: amount, recipient, date, optional note
- **Private**: amount, date only – no recipient shown

### Social feed
- Public transactions appear in a live feed
- Notes and emoji reactions
- Venmo-style social UX
- Filter: global / friends

### Contacts
- List of people you've interacted with
- **Ghost contacts** – created automatically after private payments; visible only in your app; no on-chain link

### Privacy layer (UNILINK)
- Dissociates real identity from on-chain address
- Uses temporary addresses and off-chain mapping
- Recipient identity never exposed in public data

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS, Zustand, wagmi + viem |
| Backend | NestJS, TypeScript, Prisma ORM, PostgreSQL |
| Auth | WalletConnect, cryptographic signature verification |
| Infra | Docker, docker-compose, GitHub Actions CI |

---

## Repository structure

```text
.
├─ apps/
│  ├─ frontend/
│  │  ├─ app/
│  │  │  ├─ dashboard/      – wallet + transaction history
│  │  │  ├─ send/           – send payment (public or private)
│  │  │  ├─ request/        – generate QR codes and payment links
│  │  │  ├─ feed/           – public social feed
│  │  │  ├─ contacts/       – contacts + ghost contacts
│  │  │  └─ pay/[alias]/    – payment link landing page
│  │  ├─ components/
│  │  │  ├─ feed/           – FeedItemCard, FeedList
│  │  │  ├─ contacts/       – ContactsList
│  │  │  ├─ payments/       – SendPaymentForm, PaymentLinkGenerator
│  │  │  ├─ qr/             – QrCodeDisplay
│  │  │  ├─ history/        – TransactionHistory
│  │  │  └─ wallet/         – WalletConnection
│  │  ├─ hooks/
│  │  ├─ lib/               – api.ts, wagmi.ts
│  │  └─ store/
│  └─ backend/
│     ├─ prisma/
│     └─ src/modules/
│        ├─ auth/           – wallet signature verification
│        ├─ ens/            – ENS name resolution
│        ├─ users/          – user profiles
│        ├─ payments/       – create/settle payments (public + private)
│        ├─ transactions/   – read transaction history
│        ├─ feed/           – public social feed endpoint
│        ├─ qr-codes/       – one-time + permanent QR codes
│        ├─ payment-links/  – alias-based shareable links
│        └─ contacts/       – contacts + ghost contacts
├─ packages/
│  ├─ types/                – shared TypeScript contracts
│  ├─ ui/                   – shared visual primitives
│  └─ config/               – shared ESLint + tsconfig
├─ docs/
├─ .github/
└─ docker-compose.yml
```

---

## Architecture

```text
[ Next.js Frontend (App Router) ]
        |  REST API
        v
[ NestJS Backend ]
  ├─ /payments    → public + UNILINK private payments
  ├─ /feed        → public social feed
  ├─ /qr-codes    → one-time & permanent QR
  ├─ /payment-links → alias-based pay links
  ├─ /contacts    → regular + ghost contacts
  └─ /auth + /ens + /users + /transactions
        |
        v
[ Prisma ORM ]
        |
        v
[ PostgreSQL ]
        ↕
[ Viem / Ethereum RPC (ENS resolution) ]
```

### Payment mode data flow

```text
Sender initiates payment
        |
        ├─ mode = PUBLIC
        │       └─ recipientUserId stored + exposed
        │          appears in feed with sender & recipient names
        │
        └─ mode = PRIVATE (UNILINK)
                └─ recipientUserId stored but NEVER exposed in API
                   ghost contact created in sender's contacts only
                   no on-chain identity link
```

---

## Quick start

```bash
# 1. Copy env file
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Run with Docker (recommended)
docker compose up --build

# 4. Or run locally
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000/api

---

## Environment variables

See `.env.example` for all values.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `ETHEREUM_RPC_URL` | yes | Ethereum JSON-RPC for ENS resolution |
| `NEXT_PUBLIC_API_URL` | yes | Backend API base URL |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | yes | WalletConnect cloud project ID |
| `JWT_SECRET` | yes | Secret for signing auth tokens |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run frontend + backend in dev mode |
| `npm run build` | Build all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Run all tests |

---

## API reference (summary)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/verify` | Verify wallet signature, issue session |
| `POST` | `/payments` | Create payment (PUBLIC or PRIVATE) |
| `PATCH` | `/payments/:id/settle` | Mark payment completed with tx hash |
| `GET` | `/transactions/user/:id` | Get user's transaction history |
| `GET` | `/feed` | Public social feed |
| `POST` | `/qr-codes` | Generate a QR code |
| `GET` | `/qr-codes/:id` | Get QR code details |
| `POST` | `/qr-codes/:id/use` | Mark one-time QR as used |
| `POST` | `/payment-links` | Create a payment link |
| `GET` | `/payment-links/:alias` | Resolve a payment link |
| `GET` | `/contacts/:userId` | Get contacts (regular + ghost) |
| `POST` | `/contacts` | Create a contact |
| `GET` | `/ens/resolve` | Resolve ENS name to address |

---

## Security baseline

- Helmet headers on all responses
- Global `ValidationPipe` with whitelist mode
- Rate limiting on auth endpoints
- Secrets and RPC keys via env vars only
- Private payment recipients never exposed via API

---

## Testing strategy

- **Backend**: Jest unit tests – highest risk paths first (auth, payment creation, UNILINK logic)
- **Frontend**: Vitest + Testing Library – user-critical flows
- **Integration**: auth + payment lifecycle before mainnet launch

---

## Engineering context (CLAUDE.md)

> This section is embedded so AI assistants have full project context at all times.

### Coding standards
- Strict TypeScript everywhere
- Small pure functions with explicit return types on exported APIs
- Validate all external inputs (DTOs on backend, schema checks on frontend)
- Business logic in services; controllers and React pages stay thin

### Architecture rules
- **Monorepo boundaries**: `apps/frontend` · `apps/backend` · `packages/types` · `packages/ui`
- **Backend clean layering**: `controller → service → repository → prisma`
- No direct Prisma access from controllers
- Frontend data access goes through `lib/api.ts`

### Naming conventions
- Files: kebab-case
- Classes: PascalCase
- Functions/variables: camelCase
- DTOs end with `Dto`
- Module folders pluralized (`payments`, `transactions`)

### How to add features
1. Add shared contract changes in `packages/types` first
2. Add backend DTO + controller route + service method + repository update
3. Add frontend hook/service call in `lib` or `hooks`
4. Add UI in feature component and wire in app route
5. Add tests in both apps if behavior changed
6. Update docs if API or env vars changed

### Git conventions
- **Branches**: `feat/<scope>-<short-desc>` · `fix/<scope>-<short-desc>` · `chore/<scope>-<short-desc>`
- **Commits**: `feat(payments): add recipient ENS resolution`
- PR titles mirror commit style

### Do's
- Keep commits small and scoped
- Use Conventional Commits
- Add tests for critical payment and auth logic
- Handle async errors explicitly

### Don'ts
- Do not hardcode secrets or RPC keys
- Do not couple frontend components directly to backend DB assumptions
- Do not bypass validation pipes
- Do not merge without at least one approval

---

## Production readiness checklist

- [ ] Nonce-based challenge auth with expiry and replay protection
- [ ] UNILINK: stealth address derivation for true on-chain privacy
- [ ] Audit logs and event sourcing for transaction lifecycle
- [ ] KMS-backed secrets management
- [ ] OpenTelemetry + metrics + alerts
- [ ] Real QR code image rendering (e.g. `qrcode` npm package)
- [ ] ENS reverse resolution for display names in feed
- [ ] Integration tests for full auth + payment lifecycle
