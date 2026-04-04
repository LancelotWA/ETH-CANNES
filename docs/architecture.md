# Architecture

## High-level
- Frontend: Next.js App Router with wallet UX and ENS-first send flow
- Backend: NestJS API with domain modules and Prisma repositories
- Data: PostgreSQL (users + transactions)
- Web3: Wagmi/Viem + ENS resolution + wallet signature auth

## Request flow
1. User connects wallet in frontend.
2. Frontend signs challenge message and calls `/api/auth/wallet/verify`.
3. Backend verifies signature, finds/creates user profile.
4. User sends to ENS recipient.
5. Frontend resolves ENS through `/api/ens/resolve`.
6. Frontend submits payment via `/api/payments`.
7. Transaction history fetched from `/api/transactions/user/:id`.

## Security controls
- Rate limiting on auth routes
- DTO validation and payload whitelisting
- Helmet security headers
- Environment-based config for secrets and RPC URL
