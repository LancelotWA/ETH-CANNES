# CLAUDE.md

## Purpose
Persistent engineering context for ETH Cannes Pay — a social crypto payment app (Venmo/Revolut-style) with two modes:
- **Public**: classic on-chain crypto transactions (send, receive, social feed, reactions)
- **Private**: untraceable transactions via Unlink SDK (privacy pool on Base Sepolia)

## Architecture overview

### Monorepo structure
```
apps/
  frontend/    # Next.js 14 (App Router) — presentation + client orchestration
  backend/     # NestJS API — auth, ENS resolution, Unilink privacy layer
packages/
  types/       # Shared TypeScript contracts (@ethcannes/types)
  ui/          # Shared visual primitives (@ethcannes/ui) — currently minimal/unused
```

### No database
Everything is on-chain or in-memory. There is no Prisma/Postgres in use despite a legacy schema file existing in `apps/backend/prisma/`. Do not add database dependencies.

### Frontend stack
- **Framework**: Next.js 14 with App Router
- **Wallet**: Reown AppKit + Wagmi + viem
- **State**: Zustand (`store/useAppStore.ts`)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Testing**: Vitest + Testing Library

### Frontend active pages
- `/` — redirects to dashboard
- `/dashboard` — balance, actions, recent activity
- `/send` — send payment form (ETH/USDC, paste or QR scan)
- `/request` — payment link generator with QR codes
- `/feed` — public transaction feed
- `/contacts` — contacts list
- `/pay/[alias]` — dynamic payment link checkout

### Frontend data flow
- Public transactions: direct on-chain via viem/wagmi (`lib/public/`)
- Private transactions: via backend Unilink API (`lib/private/` — placeholder, not yet implemented)
- State management: `store/useAppStore.ts` (single source of truth)
- API calls: `lib/api.ts` base wrapper

### Backend active modules (3/10)
Only these modules have actual implementations:
- **auth** — nonce-based wallet verification via viem `verifyMessage()`, JWT issuance
- **ens** — ENS name resolution via viem public client
- **unilink** — privacy pool integration via @unlink-xyz/sdk (deposit, transfer, withdraw, balances)

### Backend stub modules (7/10 — empty controllers/services)
These exist as scaffolding but have zero endpoints:
`users`, `payments`, `transactions`, `feed`, `qr-codes`, `payment-links`, `contacts`

## Coding standards
- Use strict TypeScript everywhere.
- Prefer small pure functions and explicit return types for exported APIs.
- Validate all external inputs (DTOs on backend, schema checks on frontend if added).
- Keep business logic in services; controllers and React pages stay thin.

## Naming conventions
- Files: kebab-case
- Classes: PascalCase
- Functions/variables: camelCase
- DTOs end with `Dto`
- Module folders pluralized (`payments`, `transactions`)

## How to add features
1. Add shared contract changes in `packages/types` first.
2. Backend: add DTO + controller route + service method (no DB layer — use in-memory or on-chain).
3. Frontend: add hook/service call in `lib` or `hooks`.
4. Add UI in feature component and wire in app route.
5. Add tests if behavior changed.

## Do's
- Keep commits small and scoped.
- Use Conventional Commits.
- Add tests for critical payment and auth logic.
- Handle async errors explicitly.

## Don'ts
- Do not hardcode secrets or RPC keys.
- Do not couple frontend components directly to backend assumptions.
- Do not bypass validation pipes.
- Do not merge without at least one approval.
- Do not add Prisma/database dependencies — everything is on-chain.

## Git conventions
- Branches:
  - `feat/<scope>-<short-desc>`
  - `fix/<scope>-<short-desc>`
  - `chore/<scope>-<short-desc>`
- Commit format:
  - `feat(payments): add recipient ENS resolution`
  - `fix(auth): reject invalid wallet signature`
- PR titles mirror commit style.
- Never merge direct to main. Always push branch + PR via gh cli.

## Unilink (privacy layer)
- Unilink uses the **Unlink SDK** (`@unlink-xyz/sdk`) — not a custom implementation.
- Architecture: `Frontend -> Backend (SDK + API key + user mnemonic) -> Unlink API -> Blockchain`
- The frontend **never** talks to Unlink directly. All calls go through backend `modules/unilink/`.
- Each user has an Unlink account derived from a mnemonic (stored in-memory via `UnilinkRepository`).
- User's Unlink address (Bech32m, e.g. `unlink1...`).
- Network: **Base Sepolia** (chain ID 84532) — only network supported by Unlink.
- Pool address: `0x647f9b99af97e4b79DD9Dd6de3b583236352f482`.
- Test token (faucet): `0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7`.
- Env vars: `UNLINK_API_KEY`, `UNLINK_API_URL` (backend only, never exposed to frontend).
- Shared types in `packages/types`: prefixed `Unlink*` (e.g. `UnlinkAccount`, `UnlinkTransferPayload`, `UnlinkBalance`).
- SDK instantiation:
  - `createUnlink({ engineUrl, apiKey, account, evm? })` — NOT `apiUrl`, NOT `mnemonic` directly.
  - `account` comes from `unlinkAccount.fromMnemonic({ mnemonic })`.
  - `evm` comes from `unlinkEvm.fromViem({ walletClient, publicClient })` using viem clients for Base Sepolia.
  - Mnemonic generation: `generateMnemonic(english)` from `viem/accounts`.
  - One client instance per user per request (not persisted).
- Backend endpoints under `/api/unilink/`:
  - `POST account` — create/get Unlink account
  - `GET balance/:userId` — get private balances
  - `POST deposit` — deposit into privacy pool
  - `POST transfer` — private transfer
  - `POST withdraw` — withdraw to EVM address
  - `GET transactions/:userId` — transaction history
- Private payments (`mode: "PRIVATE"`) use Unlink `transfer()` — amount, sender, recipient, token all hidden on-chain.
- Ghost contacts are created after a private transfer (sender-side only).

## Known dead code (as of 2026-04-04)

### Frontend unused files
- `components/nav.tsx` — not imported
- `components/ui/light-rays.tsx` — not imported (WebGL effect)
- `components/ui/staggered-menu.tsx` — not imported
- `hooks/useAuth.ts`, `hooks/useEnsResolution.ts`, `hooks/usePaymentLink.ts`, `hooks/useSignAndSend.ts`, `hooks/useWalletAuth.ts` — none imported
- `lib/store.ts` — deprecated duplicate of `store/useAppStore.ts`
- `lib/private/index.ts` — placeholder, throws "not implemented"

### Frontend unused npm packages
- `@base-org/account`, `@metamask/connect-evm`, `motion`, `porto` — no imports found
- `gsap` — only used by unused `staggered-menu.tsx`
- `ogl` — only used by unused `light-rays.tsx`

### Backend
- 7 stub modules with empty controllers/services (see above)
- `apps/backend/prisma/` — schema exists but Prisma is never imported or used
- `UnilinkRepository.findUserByUnlinkAddress()` — defined but never called

### Packages
- `packages/ui` Button component — not imported by any frontend component

## Testing philosophy
- Test highest-risk paths first: auth verification, payment creation, transaction reads.
- Prefer deterministic unit tests for services.
- Add integration tests for critical API workflows before mainnet launch.
- Frontend tests should validate user-critical flows, not implementation details.
