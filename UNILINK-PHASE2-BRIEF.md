# UNILINK Phase 2 — Backend Module (Brief pour implémentation)

## Contexte

ETH Cannes Pay — app de paiements crypto avec mode PRIVATE via le SDK Unlink (`@unlink-xyz/sdk`).
Le SDK est déjà installé dans `apps/backend`. Les types partagés et le schema Prisma sont prêts.

**Architecture** : `Frontend → Notre Backend (SDK + API key + mnémonique user) → Unlink API → Blockchain (Base Sepolia)`

Le frontend ne parle JAMAIS à Unlink. Tout passe par notre module backend `unilink/`.

## Référence CLAUDE.md

- Fichiers : kebab-case. Classes : PascalCase. Fonctions : camelCase. DTOs finissent par `Dto`.
- Layering : `controller → service → repository → prisma`. Pas de Prisma dans les controllers.
- Strict TypeScript. Validation des inputs via DTOs. Business logic dans les services.
- Module folder : `unilink` (singulier car nom propre, pas pluralisable).

## Ce qui existe déjà

- **Types** (`packages/types/src/index.ts`) : `UnlinkTxStatus`, `UnlinkTxType`, `UnlinkOperationResult`, `UnlinkAccount`, `UnlinkBalance`, `UnlinkTransferPayload`, `UnlinkDepositPayload`, `UnlinkWithdrawPayload`, constantes `UNLINK_TEST_TOKEN`, `UNLINK_POOL_ADDRESS`, `UNLINK_CHAIN_ID`.
- **Schema Prisma** (`apps/backend/prisma/schema.prisma`) : modèle `User` a les champs `unlinkMnemonic` (String?) et `unlinkAddress` (String?, unique).
- **Config** (`apps/backend/src/config/configuration.ts`) : `unlink.apiKey` et `unlink.apiUrl` depuis env vars.
- **Env** (`.env.example`) : `UNLINK_API_KEY`, `UNLINK_API_URL=https://staging-api.unlink.xyz`.
- **Réseau** : Base Sepolia (chain ID 84532). Pool : `0x647f9b99af97e4b79DD9Dd6de3b583236352f482`. Token test : `0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7`.

## Fichiers à créer

```
apps/backend/src/modules/unilink/
├── unilink.module.ts
├── unilink.controller.ts
├── unilink.service.ts
├── unilink.repository.ts
└── dto/
    ├── create-unilink-account.dto.ts   → { userId: UUID }
    ├── unilink-deposit.dto.ts          → { userId: UUID, token: 0x string, amount: string }
    ├── unilink-transfer.dto.ts         → { senderUserId: UUID, recipientUserId: UUID, token: 0x string, amount: string, tokenSymbol: string }
    └── unilink-withdraw.dto.ts         → { userId: UUID, recipientEvmAddress: 0x string, token: 0x string, amount: string }
```

## Fichier à modifier

- `apps/backend/src/app.module.ts` → ajouter `UnilinkModule` dans les imports.

## Repository — `unilink.repository.ts`

Accès Prisma sur le modèle User pour les champs Unlink.

```
setUnlinkAccount(userId, mnemonic, address) → stocke unlinkMnemonic + unlinkAddress
getUnlinkMnemonic(userId) → retourne le mnémonique (string | null)
getUnlinkAddress(userId) → retourne l'adresse unlink1... (string | null)
findUserByUnlinkAddress(address) → trouve un User par unlinkAddress
```

## Service — `unilink.service.ts`

Injecte : `ConfigService`, `UnilinkRepository`.

```
createClient(mnemonic: string)
  → instancie le SDK : createUnlink({ apiKey, mnemonic, evmPrivateKey, viemClients })
  → configure pour Base Sepolia (chain 84532)
  → retourne l'instance unlink

getOrCreateAccount(userId: string) → UnlinkAccount
  → si user n'a pas de unlinkMnemonic : générer un mnémonique (bip39 ou crypto)
  → createClient(mnemonic)
  → unlink.ensureRegistered()
  → unlink.getAddress() → adresse unlink1...
  → repository.setUnlinkAccount(userId, mnemonic, address)
  → retourne { unlinkAddress, registered: true }

getBalances(userId: string) → balances
  → récupère mnemonic en DB → createClient → unlink.getBalances()

deposit(userId, token, amount) → UnlinkOperationResult
  → createClient avec mnemonic du user
  → unlink.ensureErc20Approval({ token, amount })
  → unlink.deposit({ token, amount })
  → unlink.pollTransactionStatus(txId)
  → retourne { txId, status }

transfer(senderUserId, recipientUserId, token, amount) → UnlinkOperationResult
  → récupère unlinkAddress du recipient en DB
  → createClient avec mnemonic du SENDER
  → unlink.transfer({ recipientAddress, token, amount })
  → unlink.pollTransactionStatus(txId)
  → retourne { txId, status }

withdraw(userId, recipientEvmAddress, token, amount) → UnlinkOperationResult
  → createClient avec mnemonic du user
  → unlink.withdraw({ recipientEvmAddress, token, amount })
  → unlink.pollTransactionStatus(txId)
  → retourne { txId, status }

getTransactions(userId, type?, limit?) → transactions[]
  → createClient → unlink.getTransactions({ type, limit })
```

## Controller — `unilink.controller.ts`

Préfixe : `@Controller('unilink')`

```
POST   /api/unilink/account              → getOrCreateAccount(dto.userId)         → { unlinkAddress }
GET    /api/unilink/balance/:userId       → getBalances(userId)                    → UnlinkBalance[]
POST   /api/unilink/deposit               → deposit(dto.userId, dto.token, dto.amount) → { txId, status }
POST   /api/unilink/transfer              → transfer(dto.senderUserId, dto.recipientUserId, dto.token, dto.amount) → { txId, status }
POST   /api/unilink/withdraw              → withdraw(dto.userId, dto.recipientEvmAddress, dto.token, dto.amount)   → { txId, status }
GET    /api/unilink/transactions/:userId  → getTransactions(userId)               → transactions[]
```

## SDK Unlink — Référence rapide

```typescript
import { createUnlink } from "@unlink-xyz/sdk";

// Instanciation (1 par user par requête)
const unlink = createUnlink({
  apiKey: "...",
  mnemonic: "word1 word2 ...",       // mnémonique du user
  evmPrivateKey: "0x...",            // dérivé du mnemonic (pour deposit/withdraw)
  publicClient: viemPublicClient,    // viem, Base Sepolia
  walletClient: viemWalletClient,    // viem, Base Sepolia
});

// Opérations
await unlink.ensureRegistered();
const address = await unlink.getAddress();                    // "unlink1..."
const balances = await unlink.getBalances({ token? });
await unlink.ensureErc20Approval({ token, amount });
const { txId } = await unlink.deposit({ token, amount });
const { txId } = await unlink.transfer({ recipientAddress, token, amount });
const { txId } = await unlink.withdraw({ recipientEvmAddress, token, amount });
const confirmed = await unlink.pollTransactionStatus(txId);   // attend "processed"
const history = await unlink.getTransactions({ type?, limit?, cursor? });
```

## Ordre d'implémentation

1. DTOs (aucune dépendance)
2. Repository (dépend de Prisma, déjà en place)
3. Service (dépend de repository + SDK + config)
4. Controller (dépend du service)
5. Module (assemble tout)
6. Ajouter UnilinkModule dans app.module.ts
