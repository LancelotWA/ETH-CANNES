# UNILINK — Roadmap perso (Hugo)

> Ce fichier est ton guide personnel pour implémenter la couche UNILINK dans ETH Cannes Pay.
> Il détaille chaque étape, ce qu'elle fait, pourquoi, et les fichiers concernés.

---

## Comment fonctionne Unlink (le SDK)

Unlink est un **privacy pool** déployé sur Base Sepolia. Le SDK `@unlink-xyz/sdk` permet 4 opérations :

| Opération | Ce qu'elle fait | Ce qui est visible on-chain |
|-----------|-----------------|-----------------------------|
| `deposit()` | Dépose des ERC-20 dans le pool | Montant + sender + token (recipient caché) |
| `transfer()` | Transfert privé entre 2 comptes Unlink | **Rien** (tout est caché : montant, sender, recipient, token) |
| `withdraw()` | Retire du pool vers une adresse EVM | Montant + recipient + token (sender caché) |
| `execute()` | Appelle un smart contract depuis le pool | Montant + recipient + token (sender caché) |

**Architecture** : le frontend ne parle JAMAIS à Unlink. Tout passe par notre backend :
```
Frontend → Notre Backend (SDK + API key + mnémonique user) → Unlink API → Blockchain
```

Chaque user a un **mnémonique** stocké côté backend qui dérive sa clé privée Unlink. Ce mnémonique ne quitte jamais le serveur.

**Réseau** : Base Sepolia (chain ID 84532) — seul réseau supporté par Unlink actuellement, Sepolia classique (11155111) n'est PAS disponible
**Pool** : `0x647f9b99af97e4b79DD9Dd6de3b583236352f482`
**Token de test (faucet)** : `0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7`
**API key** : à récupérer sur https://hackaton-apikey.vercel.app

---

## Etapes d'implémentation

### Phase 1 — Setup & Types [FAIT]

#### 1.1 Types partagés
- **Fichier** : `packages/types/src/index.ts`
- **Ce qu'on a ajouté** :
  - `UnlinkTxStatus` : les statuts possibles d'une tx Unlink (`pending`, `relayed`, `processed`, `failed`)
  - `UnlinkTxType` : les types d'opérations (`deposit`, `transfer`, `withdraw`, `execute`)
  - `UnlinkOperationResult` : retour standard après une opération `{ txId, status }`
  - `UnlinkAccount` : infos du compte Unlink d'un user `{ unlinkAddress, registered }`
  - `UnlinkBalance` : solde dans le pool `{ token, tokenSymbol, amount }`
  - `UnlinkTransferPayload` : payload envoyé par le frontend pour un transfert privé
  - `UnlinkDepositPayload` : payload pour déposer dans le pool
  - `UnlinkWithdrawPayload` : payload pour retirer du pool
  - Constantes : `UNLINK_TEST_TOKEN`, `UNLINK_POOL_ADDRESS`, `UNLINK_CHAIN_ID`
- **Pourquoi** : ces types sont le contrat entre le frontend et le backend. Tout le monde les importe depuis `@ethcannes/types`.

#### 1.2 Variables d'environnement
- **Fichiers** : `.env.example` + `apps/backend/src/config/configuration.ts`
- **Ce qu'on a ajouté** :
  - `UNLINK_API_KEY` : clé API pour le SDK Unlink
  - `UNLINK_API_URL` : URL de l'API staging (`https://staging-api.unlink.xyz`)
- **Pourquoi** : le SDK a besoin de la clé API pour authentifier les requêtes. Jamais hardcodé.

#### 1.3 Schema Prisma
- **Fichier** : `apps/backend/prisma/schema.prisma`
- **Ce qu'on a ajouté sur le modèle `User`** :
  - `unlinkMnemonic` (String?) : le mnémonique chiffré du compte Unlink du user
  - `unlinkAddress` (String?, unique) : l'adresse Bech32m Unlink (ex: `unlink1abc...`)
- **Pourquoi** : chaque user a besoin d'un compte Unlink propre. Le mnémonique est la "clé maître" qui dérive la clé privée. L'adresse est publique (on peut la partager pour recevoir des transferts privés).

---

### Phase 2 — Backend : Module Unilink [A FAIRE]

#### 2.1 Installer le SDK
```bash
cd apps/backend && npm install @unlink-xyz/sdk
```

#### 2.2 Service : `apps/backend/src/modules/unilink/unilink.service.ts`

C'est le coeur de l'implémentation. Fonctions à créer :

| Fonction | Ce qu'elle fait | SDK utilisé |
|----------|-----------------|-------------|
| `createClient(mnemonic)` | Instancie un client Unlink pour un user | `createUnlink({ apiKey, mnemonic, ... })` |
| `getOrCreateAccount(userId)` | Génère un mnémonique si le user n'en a pas, le stocke en DB, retourne l'adresse Unlink | `unlink.getAddress()` + `unlink.ensureRegistered()` |
| `getAddress(userId)` | Retourne l'adresse Unlink du user | `unlink.getAddress()` |
| `getBalances(userId, token?)` | Retourne les soldes privés du user | `unlink.getBalances({ token? })` |
| `deposit(userId, token, amount)` | Dépose des tokens dans le pool | `unlink.ensureErc20Approval()` + `unlink.deposit()` + `unlink.pollTransactionStatus()` |
| `transfer(senderUserId, recipientUserId, token, amount)` | Transfert privé entre 2 users | Résout l'adresse Unlink du recipient → `unlink.transfer({ recipientAddress, token, amount })` |
| `withdraw(userId, recipientEvmAddress, token, amount)` | Retire vers une adresse EVM | `unlink.withdraw({ recipientEvmAddress, token, amount })` |
| `getTransactions(userId, type?, limit?)` | Historique des tx Unlink | `unlink.getTransactions({ type, limit, cursor })` |

**Point important** : `createClient()` est appelé à chaque requête avec le mnémonique du user concerné. Le client n'est pas persisté en mémoire.

**Génération du mnémonique** : utiliser `crypto.randomBytes()` ou une lib BIP39 pour générer un mnémonique standard 12/24 mots. Le stocker en DB (idéalement chiffré, mais pour le hackathon on peut stocker en clair).

#### 2.3 Controller : `apps/backend/src/modules/unilink/unilink.controller.ts`

| Endpoint | Méthode | DTO | Ce qu'il fait |
|----------|---------|-----|---------------|
| `/unilink/account` | POST | `{ userId }` | Crée/récupère le compte Unlink → retourne `{ unlinkAddress }` |
| `/unilink/balance/:userId` | GET | — | Retourne les soldes privés |
| `/unilink/deposit` | POST | `{ userId, token, amount }` | Dépose dans le pool |
| `/unilink/transfer` | POST | `{ senderUserId, recipientUserId, token, amount, tokenSymbol }` | Transfert privé — c'est LE endpoint clé pour les paiements UNILINK |
| `/unilink/withdraw` | POST | `{ userId, recipientEvmAddress, token, amount }` | Retire du pool vers une adresse EVM |
| `/unilink/transactions/:userId` | GET | Query: `type?`, `limit?` | Historique des tx Unlink du user |

#### 2.4 DTOs : `apps/backend/src/modules/unilink/dto/`

Chaque DTO valide les inputs avec `class-validator` :
- `CreateUnilinkAccountDto` : `userId` (UUID)
- `UnilinkDepositDto` : `userId`, `token` (adresse 0x), `amount` (string > 0)
- `UnilinkTransferDto` : `senderUserId`, `recipientUserId`, `token`, `amount`, `tokenSymbol`
- `UnilinkWithdrawDto` : `userId`, `recipientEvmAddress` (adresse 0x), `token`, `amount`

#### 2.5 Repository : `apps/backend/src/modules/unilink/unilink.repository.ts`

Accès Prisma pour lire/écrire les champs Unlink du User :
- `setUnlinkAccount(userId, mnemonic, address)` : stocke le mnémonique + adresse
- `getUnlinkMnemonic(userId)` : récupère le mnémonique
- `getUnlinkAddress(userId)` : récupère l'adresse
- `findUserByUnlinkAddress(address)` : trouve un user par son adresse Unlink

#### 2.6 Module : `apps/backend/src/modules/unilink/unilink.module.ts`

Enregistre le controller + service + repository. Importe `ConfigModule` pour accéder à `UNLINK_API_KEY`.
**Ne pas oublier** d'ajouter `UnilinkModule` dans les imports de `app.module.ts`.

---

### Phase 3 — Frontend : Lib & Hooks [A FAIRE]

#### 3.1 Lib API : `apps/frontend/lib/unilink.ts`

Fonctions qui appellent les endpoints backend via `postJson`/`getJson` :

```typescript
createUnilinkAccount(userId: string): Promise<UnlinkAccount>
getUnilinkBalance(userId: string): Promise<UnlinkBalance[]>
depositToUnilink(payload: UnlinkDepositPayload): Promise<UnlinkOperationResult>
transferPrivate(payload: UnlinkTransferPayload): Promise<UnlinkOperationResult>
withdrawFromUnilink(payload: UnlinkWithdrawPayload): Promise<UnlinkOperationResult>
```

**Rappel** : le frontend ne touche JAMAIS au SDK Unlink directement. Tout passe par notre API.

#### 3.2 Hook : `apps/frontend/hooks/use-unilink-send.ts`

Le hook `useUnilinkSend()` orchestre un paiement privé complet :
1. Vérifie que le sender a un compte Unlink (sinon le crée via `createUnilinkAccount`)
2. Vérifie que le recipient a un compte Unlink (idem)
3. Appelle `transferPrivate()` pour le transfert dans le pool
4. Appelle `POST /payments` avec `mode: "PRIVATE"` pour enregistrer la tx dans notre DB
5. Crée un ghost contact dans les contacts du sender

Expose : `{ send, loading, error, result }`

#### 3.3 Hook : `apps/frontend/hooks/use-unilink-balance.ts`

Le hook `useUnilinkBalance(userId)` :
- Appelle `getUnilinkBalance()` au mount
- Expose `{ balances, loading, error, refetch }`
- Utilisé dans le dashboard pour afficher le solde privé

---

### Phase 4 — Intégration dans l'UI existante [A FAIRE]

#### 4.1 SendPaymentForm
- **Fichier** : `apps/frontend/components/payments/send-payment-form.tsx`
- Quand `mode === "PRIVATE"`, utiliser `useUnilinkSend()` au lieu du flow classique
- Le bouton "Send" déclenche le flow Unlink complet (account check → transfer → record payment → ghost contact)

#### 4.2 Dashboard — Solde privé
- **Fichier** : `apps/frontend/app/dashboard/page.tsx`
- Ajouter une section "Private Balance" qui utilise `useUnilinkBalance()`
- Afficher les tokens et montants dans le pool

#### 4.3 Transaction History — Affichage PRIVATE
- **Fichier** : `apps/frontend/components/history/transaction-history.tsx`
- Pour les tx avec `mode === "PRIVATE"` : afficher "Paiement privé" sans sender/recipient
- Ne pas afficher le `txHash` (il n'y en a pas pour les transfers Unlink)

#### 4.4 Feed — Validation
- **Fichier** : `apps/backend/src/modules/feed/feed.service.ts`
- S'assurer que `getPublicFeed()` filtre bien `mode: "PUBLIC"` (c'est déjà le cas)
- Tester qu'aucune tx PRIVATE n'apparaît

#### 4.5 Ghost contacts
- Après un transfer privé réussi, le hook `useUnilinkSend` appelle `POST /contacts` avec `isGhost: true`
- Le ghost contact apparaît dans la liste des contacts avec l'emoji 👻
- Vérifier avec la personne B qui gère les contacts

---

### Phase 5 — Tests [A FAIRE]

| Test | Priorité | Ce qu'il vérifie |
|------|----------|-----------------|
| `unilink.service.spec.ts` — createClient | Haute | Le SDK s'instancie correctement avec la config |
| `unilink.service.spec.ts` — getOrCreateAccount | Haute | Génère un mnémonique, stocke en DB, retourne une adresse valide |
| `unilink.service.spec.ts` — transfer | Haute | Résout les 2 adresses, appelle le SDK, retourne un résultat |
| `unilink.controller.spec.ts` — POST /transfer | Haute | Valide le DTO, appelle le service, retourne 201 |
| `feed.service.spec.ts` — no PRIVATE leak | Critique | Le feed ne retourne AUCUNE tx avec mode PRIVATE |
| `transactions` — masquage PRIVATE | Haute | L'historique masque sender/recipient pour les tx PRIVATE |
| Round-trip faucet → deposit → transfer → withdraw | Moyenne | Flow complet end-to-end sur Base Sepolia staging |

---

### Phase 6 — Démo [A FAIRE]

Scénario : **Alice envoie 50 USDC à Bob via UNILINK**

1. Alice connecte son wallet → dashboard affiche son solde public ET privé
2. Alice va sur `/send`, sélectionne mode "PRIVATE (UNILINK)"
3. Alice entre l'adresse/ENS de Bob, 50 USDC
4. Le système :
   - Crée les comptes Unlink d'Alice et Bob si nécessaire
   - Transfère 50 USDC dans le privacy pool
   - Enregistre la tx en mode PRIVATE dans notre DB
   - Crée un ghost contact "Ghost #1" dans les contacts d'Alice
5. **Feed public** : aucune mention de la transaction
6. **Contacts d'Alice** : 👻 Ghost #1 apparaît
7. **Historique de Bob** : "50 USDC reçus" — pas d'expéditeur affiché
8. **Contraste** : refaire le même envoi en mode PUBLIC → la tx apparaît dans le feed avec "Alice → Bob"

---

## Fichiers créés/modifiés — Récap

### Déjà fait (Phase 1)
- [x] `packages/types/src/index.ts` — types Unilink ajoutés
- [x] `.env.example` — vars UNLINK_API_KEY et UNLINK_API_URL
- [x] `apps/backend/src/config/configuration.ts` — config unlink
- [x] `apps/backend/prisma/schema.prisma` — champs unlinkMnemonic + unlinkAddress sur User

### Fait (Phase 2)
- [x] `apps/backend/src/modules/unilink/unilink.module.ts`
- [x] `apps/backend/src/modules/unilink/unilink.controller.ts`
- [x] `apps/backend/src/modules/unilink/unilink.service.ts`
- [x] `apps/backend/src/modules/unilink/unilink.repository.ts`
- [x] `apps/backend/src/modules/unilink/dto/create-unilink-account.dto.ts`
- [x] `apps/backend/src/modules/unilink/dto/unilink-deposit.dto.ts`
- [x] `apps/backend/src/modules/unilink/dto/unilink-transfer.dto.ts`
- [x] `apps/backend/src/modules/unilink/dto/unilink-withdraw.dto.ts`
- [x] `apps/backend/src/app.module.ts` — UnilinkModule ajouté dans les imports

### Fait (Tests)
- [x] `apps/backend/test/unilink.service.spec.ts` — 14 tests (tous passent)

### Fait (Doc intégration)
- [x] `UNILINK-INTEGRATION.md` — Guide pour frontend (A) et contacts (B)

### A faire par les autres (Phase 3)
- [ ] `apps/frontend/lib/unilink.ts`
- [ ] `apps/frontend/hooks/use-unilink-send.ts`
- [ ] `apps/frontend/hooks/use-unilink-balance.ts`

### A modifier (Phase 4)
- [ ] `apps/frontend/components/payments/send-payment-form.tsx`
- [ ] `apps/frontend/app/dashboard/page.tsx`
- [ ] `apps/frontend/components/history/transaction-history.tsx`
- [ ] `apps/backend/src/app.module.ts` (ajouter UnilinkModule)

---

## Liens utiles

- **Doc Unlink** : https://docs.unlink.xyz
- **API key hackathon** : https://hackaton-apikey.vercel.app
- **Faucet** : https://hackaton-apikey.vercel.app/faucet
- **SDK npm** : https://www.npmjs.com/org/unlink-xyz
- **Support Telegram** : https://t.me/+E9EXrwnsXuUyZGI8
- **Base Sepolia Faucet (ETH)** : via Alchemy
