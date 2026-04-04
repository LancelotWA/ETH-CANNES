# ETH Cannes Pay

A crypto-native fintech application for private social payments using wallet identity and ENS names.

## Vision
Deliver Venmo-like UX for Web3 users:
- Send payments to human-readable identities (`alice.eth`)
- Authenticate with wallet signatures, no passwords
- Provide checkout-ready rails for WalletConnect Pay
- Keep architecture clean for fast startup iteration

## Core features
- Wallet signature authentication
- ENS name resolution
- Send payment flow with transaction persistence
- User dashboard with transaction history
- Shared types and UI primitives in monorepo packages

## Tech stack
- Frontend: Next.js (App Router), TypeScript, TailwindCSS, Zustand, wagmi + viem
- Backend: NestJS, TypeScript, Prisma ORM, PostgreSQL
- Infra: Docker, docker-compose, GitHub Actions CI

## Repository structure
```text
.
├─ apps/
│  ├─ frontend/
│  │  ├─ app/
│  │  ├─ components/
│  │  ├─ hooks/
│  │  ├─ lib/
│  │  └─ store/
│  └─ backend/
│     ├─ prisma/
│     ├─ src/modules/
│     │  ├─ auth/
│     │  ├─ ens/
│     │  ├─ users/
│     │  ├─ payments/
│     │  └─ transactions/
│     └─ test/
├─ packages/
│  ├─ ui/
│  ├─ config/
│  └─ types/
├─ docs/
├─ .github/
└─ docker-compose.yml
```

## Architecture diagram
```text
[ Next.js Frontend ]
      |  REST API
      v
[ NestJS Backend ] --- [ Viem ENS / Ethereum RPC ]
      |
      v
[ Prisma ORM ]
      |
      v
[ PostgreSQL ]
```

## Quick start
1. Copy env file
```bash
cp .env.example .env
```

2. Install dependencies
```bash
npm install
```

3. Run with Docker
```bash
docker compose up --build
```

4. Or run locally
```bash
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:4000/api

## Environment variables
See `.env.example` for all values.

Required keys:
- `DATABASE_URL`
- `ETHEREUM_RPC_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `JWT_SECRET`

## Scripts
- `npm run dev` - run both apps in dev mode
- `npm run build` - build all workspaces
- `npm run lint` - lint all workspaces
- `npm run test` - run backend + frontend tests

## Security baseline
- Helmet headers enabled in backend
- Global request validation and whitelist mode
- Route rate limiting for auth endpoints
- Secret and endpoint config via env vars only

## Team collaboration
### Suggested ownership
- Dev A: Frontend UX and shared UI
- Dev B: Wallet/Web3 integration and ENS
- Dev C: Backend modules and database
- Dev D: DevOps, CI/CD, quality gates

### Git workflow
- Main branches: `main`, `develop`
- Feature branches: `feat/<scope>-<short-desc>`
- Bugfix branches: `fix/<scope>-<short-desc>`
- Open PR into `develop`, squash merge after approval

### PR process
- Use `.github/pull_request_template.md`
- Minimum 1 reviewer from impacted ownership area
- CI must pass (lint/build/test)

### Commit convention
Conventional Commits:
- `feat(auth): add wallet signature verification`
- `fix(payments): prevent self-transfer`
- `chore(ci): add cache for npm install`

## Contributing guide
1. Create issue or pick existing ticket
2. Branch from `develop`
3. Implement with tests
4. Run `npm run lint && npm run test`
5. Open PR with summary, risks, and rollback notes

## Testing strategy
- Backend: Jest unit tests for service-level payment/auth logic
- Frontend: Vitest + Testing Library for user flows
- Future: add integration tests for full auth + payment lifecycle

## Production readiness next steps
- Add nonce-based challenge auth with expiry and replay protection
- Add audit logs and event sourcing for transaction lifecycle
- Add KMS-backed secrets management and cloud deploy manifests
- Add observability (OpenTelemetry + metrics + alerts)
