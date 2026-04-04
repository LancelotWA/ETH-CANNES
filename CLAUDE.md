# CLAUDE.md

## Purpose
Persistent engineering context for ETH Cannes Pay.

## Coding standards
- Use strict TypeScript everywhere.
- Prefer small pure functions and explicit return types for exported APIs.
- Validate all external inputs (DTOs on backend, schema checks on frontend if added).
- Keep business logic in services; controllers and React pages stay thin.

## Architecture rules
- Monorepo boundaries:
  - `apps/frontend`: presentation + client orchestration
  - `apps/backend`: API + domain logic
  - `packages/types`: cross-app contracts
  - `packages/ui`: shared visual primitives
- Backend clean layering:
  - `controller -> service -> repository -> prisma`
- No direct Prisma access from controllers.
- Frontend data access should go through `lib/api.ts`.

## Naming conventions
- Files: kebab-case
- Classes: PascalCase
- Functions/variables: camelCase
- DTOs end with `Dto`
- Module folders pluralized (`payments`, `transactions`)

## How to add features
1. Add shared contract changes in `packages/types` first.
2. Add backend DTO + controller route + service method + repository update.
3. Add frontend hook/service call in `lib` or `hooks`.
4. Add UI in feature component and wire in app route.
5. Add tests in both apps if behavior changed.
6. Update docs if API or env vars changed.

## Do's
- Keep commits small and scoped.
- Use Conventional Commits.
- Add tests for critical payment and auth logic.
- Handle async errors explicitly.

## Don'ts
- Do not hardcode secrets or RPC keys.
- Do not couple frontend components directly to backend DB assumptions.
- Do not bypass validation pipes.
- Do not merge without at least one approval.

## Git conventions
- Branches:
  - `feat/<scope>-<short-desc>`
  - `fix/<scope>-<short-desc>`
  - `chore/<scope>-<short-desc>`
- Commit format:
  - `feat(payments): add recipient ENS resolution`
  - `fix(auth): reject invalid wallet signature`
- PR titles mirror commit style.

## Unilink (privacy layer)
- Unilink uses the **Unlink SDK** (`@unlink-xyz/sdk`) — not a custom implementation.
- Architecture: `Frontend → Backend (SDK + API key + user mnemonic) → Unlink API → Blockchain`
- The frontend **never** talks to Unlink directly. All calls go through our backend module `modules/unilink/`.
- Each user has an Unlink account derived from a mnemonic stored in `User.unlinkMnemonic` (Prisma).
- User's Unlink address (Bech32m, e.g. `unlink1...`) stored in `User.unlinkAddress`.
- Network: **Base Sepolia** (chain ID 84532) — seul réseau supporté par Unlink.
- Pool address: `0x647f9b99af97e4b79DD9Dd6de3b583236352f482`.
- Test token (faucet): `0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7`.
- Env vars: `UNLINK_API_KEY`, `UNLINK_API_URL` (backend only, never exposed to frontend).
- Shared types in `packages/types`: prefixed `Unlink*` (e.g. `UnlinkAccount`, `UnlinkTransferPayload`, `UnlinkBalance`).
- SDK instantiation (real signatures, verified against `@unlink-xyz/sdk` types):
  - `createUnlink({ engineUrl, apiKey, account, evm? })` — NOT `apiUrl`, NOT `mnemonic` directly.
  - `account` comes from `unlinkAccount.fromMnemonic({ mnemonic })`.
  - `evm` comes from `unlinkEvm.fromViem({ walletClient, publicClient })` using viem clients for Base Sepolia.
  - Mnemonic generation: `generateMnemonic(english)` from `viem/accounts`.
  - One client instance per user per request (not persisted).
- Backend module: `modules/unilink/` — controller, service, repository, DTOs.
- Backend service functions: `createClient`, `getOrCreateAccount`, `getBalances`, `deposit`, `transfer`, `withdraw`, `getTransactions`.
- Backend endpoints under `/api/unilink/` — `POST account`, `GET balance/:userId`, `POST deposit`, `POST transfer`, `POST withdraw`, `GET transactions/:userId`.
- Frontend lib (TODO): `apps/frontend/lib/unilink.ts` (API calls).
- Frontend hooks (TODO): `use-unilink-send.ts`, `use-unilink-balance.ts`.
- Private payments (`mode: "PRIVATE"`) use Unlink `transfer()` — amount, sender, recipient, token all hidden on-chain.
- Ghost contacts are created after a private transfer (sender-side only).

## Testing philosophy
- Test highest-risk paths first: auth verification, payment creation, transaction reads.
- Prefer deterministic unit tests for services.
- Add integration tests for critical API workflows before mainnet launch.
- Frontend tests should validate user-critical flows, not implementation details.
