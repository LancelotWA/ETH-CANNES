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

## Testing philosophy
- Test highest-risk paths first: auth verification, payment creation, transaction reads.
- Prefer deterministic unit tests for services.
- Add integration tests for critical API workflows before mainnet launch.
- Frontend tests should validate user-critical flows, not implementation details.
