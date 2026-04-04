# UNILINK — Guide d'intégration pour l'équipe

> Ce document décrit les endpoints backend Unilink disponibles et comment s'y brancher depuis le frontend et les autres modules.

---

## Statut

| Composant | Statut | Responsable |
|-----------|--------|-------------|
| Types partagés (`packages/types`) | FAIT | Hugo (C) |
| Schema Prisma (champs Unlink sur User) | FAIT | Hugo (C) |
| Backend module `unilink/` (service, controller, repo, DTOs) | FAIT | Hugo (C) |
| Tests unitaires backend (14 tests) | FAIT | Hugo (C) |
| Frontend lib (`lib/unilink.ts`) | A FAIRE | Personne A (frontend) |
| Frontend hooks (`use-unilink-send`, `use-unilink-balance`) | A FAIRE | Personne A (frontend) |
| Branchement dans `SendPaymentForm` | A FAIRE | Personne A (frontend) |
| Ghost contacts après transfer privé | A VALIDER | Personne B (contacts) |
| Migration Prisma (`db:migrate`) | A FAIRE | Avant premier lancement |

---

## Prérequis

### Variables d'environnement (backend uniquement)

```env
UNLINK_API_KEY=<obtenir sur https://hackaton-apikey.vercel.app>
UNLINK_API_URL=https://staging-api.unlink.xyz
```

### Migration Prisma

Les champs `unlinkMnemonic` et `unlinkAddress` ont été ajoutés au modèle `User`. Avant de lancer le backend :

```bash
cd apps/backend
npx prisma migrate dev --name add-unilink-fields
```

---

## Endpoints disponibles

Base URL : `http://localhost:4000/api/unilink`

### 1. Créer / récupérer un compte Unlink

```
POST /api/unilink/account
```

**Body** :
```json
{ "userId": "uuid-du-user" }
```

**Réponse** :
```json
{ "unlinkAddress": "unlink1abc...", "registered": true }
```

**Comportement** :
- Si le user a déjà un compte → retourne l'adresse existante
- Sinon → génère un mnémonique, enregistre sur le pool Unlink, stocke en DB, retourne la nouvelle adresse
- **A appeler avant tout deposit/transfer/withdraw**

---

### 2. Consulter le solde privé

```
GET /api/unilink/balance/:userId
```

**Réponse** : les soldes dans le pool Unlink (format SDK, contient token + amount par token).

---

### 3. Déposer dans le pool

```
POST /api/unilink/deposit
```

**Body** :
```json
{
  "userId": "uuid-du-user",
  "token": "0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7",
  "amount": "50000000000000000000"
}
```

**Réponse** :
```json
{ "txId": "...", "status": "processed" }
```

**Notes** :
- `amount` est en **wei** (string). 50 USDC avec 18 décimales = `"50000000000000000000"`
- Le token de test (faucet) : `0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7`
- Opération **on-chain visible** : on voit que le user a déposé X tokens
- L'approbation Permit2 est gérée automatiquement par le service

---

### 4. Transfert privé (LE endpoint clé)

```
POST /api/unilink/transfer
```

**Body** :
```json
{
  "senderUserId": "uuid-alice",
  "recipientUserId": "uuid-bob",
  "token": "0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7",
  "amount": "50000000000000000000",
  "tokenSymbol": "USDC"
}
```

**Réponse** :
```json
{ "txId": "...", "status": "processed" }
```

**Comportement** :
- Résout l'adresse Unlink du recipient en DB
- Exécute un transfert dans le privacy pool via ZK proof
- **Entièrement invisible on-chain** : ni montant, ni sender, ni recipient, ni token
- Rejette si sender == recipient (400)
- Rejette si le recipient n'a pas de compte Unlink (404)
- Rejette si le sender n'a pas de compte Unlink (404)

**Important pour le frontend** :
- Les deux users doivent avoir un compte Unlink AVANT le transfer → appeler `POST /account` pour chacun
- Le sender doit avoir un solde suffisant dans le pool → vérifier avec `GET /balance/:userId`
- Après un transfer réussi, le frontend devrait :
  1. Appeler `POST /payments` avec `mode: "PRIVATE"` pour enregistrer dans notre DB
  2. Appeler `POST /contacts` avec `isGhost: true` pour créer le ghost contact (personne B)

---

### 5. Retirer du pool

```
POST /api/unilink/withdraw
```

**Body** :
```json
{
  "userId": "uuid-du-user",
  "recipientEvmAddress": "0xAbCdEf...",
  "token": "0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7",
  "amount": "50000000000000000000"
}
```

**Réponse** :
```json
{ "txId": "...", "status": "processed" }
```

**Notes** :
- Opération **partiellement visible** on-chain : on voit le montant + le recipient, mais pas le sender
- `recipientEvmAddress` = n'importe quelle adresse EVM (pas forcément un user de notre app)

---

### 6. Historique des transactions Unlink

```
GET /api/unilink/transactions/:userId?type=transfer&limit=20
```

**Query params** (optionnels) :
- `type` : `deposit`, `transfer`, `withdraw`, `execute`
- `limit` : nombre de résultats

**Réponse** : liste de transactions depuis le SDK Unlink (pas notre DB interne).

---

## Flow complet d'un paiement PRIVATE (pour le frontend)

```
1. POST /api/unilink/account  { userId: senderUserId }     → s'assurer que le sender a un compte
2. POST /api/unilink/account  { userId: recipientUserId }   → s'assurer que le recipient a un compte
3. GET  /api/unilink/balance/senderUserId                   → vérifier que le solde est suffisant
4. POST /api/unilink/transfer { senderUserId, recipientUserId, token, amount, tokenSymbol }
5. POST /api/payments         { senderUserId, amount, tokenSymbol, mode: "PRIVATE" }  → enregistrer en DB
6. POST /api/contacts         { userId: senderUserId, alias: "Ghost #N", isGhost: true }  → ghost contact
```

Les étapes 1-4 sont gérées par le module Unilink (Hugo/C).
L'étape 5 est gérée par le module Payments (déjà existant).
L'étape 6 est gérée par le module Contacts (personne B).
L'orchestration (appeler 1→6 dans l'ordre) est le travail du **frontend (personne A)**.

---

## Flow complet d'un pré-alimentement du pool (pour le frontend)

```
1. POST /api/unilink/account  { userId }        → s'assurer que le user a un compte
2. POST /api/unilink/deposit  { userId, token, amount }  → déposer dans le pool
3. GET  /api/unilink/balance/userId              → vérifier le nouveau solde
```

Le user peut ensuite faire autant de transfers privés qu'il veut sans re-déposer, tant qu'il a du solde.

---

## Types partagés disponibles (`@ethcannes/types`)

```typescript
import {
  UnlinkTxStatus,           // "pending" | "relayed" | "processed" | "failed"
  UnlinkTxType,             // "deposit" | "transfer" | "withdraw" | "execute"
  UnlinkOperationResult,    // { txId: string; status: UnlinkTxStatus }
  UnlinkAccount,            // { unlinkAddress: string; registered: boolean }
  UnlinkBalance,            // { token: WalletAddress; tokenSymbol: string; amount: string }
  UnlinkTransferPayload,    // { senderUserId, recipientUserId, token, amount, tokenSymbol }
  UnlinkDepositPayload,     // { userId, token, amount }
  UnlinkWithdrawPayload,    // { userId, recipientEvmAddress, token, amount }
  UNLINK_TEST_TOKEN,        // "0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7"
  UNLINK_POOL_ADDRESS,      // "0x647f9b99af97e4b79DD9Dd6de3b583236352f482"
  UNLINK_CHAIN_ID,          // 84532 (Base Sepolia)
} from "@ethcannes/types";
```

---

## Erreurs possibles

| Code | Quand | Message |
|------|-------|---------|
| 400 | Transfer vers soi-même | "Cannot transfer to yourself" |
| 400 | DTO invalide (champ manquant, format incorrect) | Détails de validation |
| 404 | User n'a pas de compte Unlink | "User {id} has no Unlink account" |
| 404 | Recipient n'a pas de compte Unlink | "Recipient {id} has no Unlink account" |
| 500 | Erreur SDK Unlink (réseau, pool, API down) | Erreur interne |

---

## Ce qui NE passe PAS par nos endpoints

- **Le feed public** (`GET /api/feed`) : filtre déjà `mode: "PUBLIC"` uniquement → les transactions privées n'y apparaissent jamais. Rien à changer.
- **L'historique** (`GET /api/transactions/user/:id`) : retourne les transactions de notre DB. Pour les PRIVATE, `recipientUserId` est `null`. Le frontend doit afficher "Paiement privé" au lieu du nom du recipient.

---

## Réseau et constantes

| Clé | Valeur |
|-----|--------|
| Chain | Base Sepolia |
| Chain ID | 84532 |
| Pool address | `0x647f9b99af97e4b79DD9Dd6de3b583236352f482` |
| Token de test (faucet) | `0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7` |
| API Unlink staging | `https://staging-api.unlink.xyz` |
| API key | Obtenir sur https://hackaton-apikey.vercel.app |
| Faucet tokens | https://hackaton-apikey.vercel.app/faucet |
