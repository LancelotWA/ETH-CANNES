# Web3 Hooks — Référence d'intégration

> Auteur : Personne D — Web3 & Paiements  
> Stack : wagmi v2 · viem · WalletConnect · Base Sepolia (chainId 84532)  
> Toutes les fonctions sont des hooks React (`"use client"`, Next.js 14 App Router).

---

## Sommaire

1. [Configuration wagmi](#1-configuration-wagmi)
2. [Store auth (Zustand)](#2-store-auth-zustand)
3. [useWalletAuth](#3-usewalletauth)
4. [useSignAndSend](#4-usesignandsend)
5. [useEnsResolution / useEnsName / useEnsAddress](#5-ens-hooks)
6. [usePaymentLink / useQRCode](#6-usepaymentlink--useqrcode)
7. [Variables d'environnement](#7-variables-denvironnement)
8. [Endpoints backend requis](#8-endpoints-backend-requis-personne-b)
9. [Contrat avec Personne C (Unlink)](#9-contrat-avec-personne-c-unlink)

---

## 1. Configuration wagmi

**Fichier :** `lib/wagmi.ts`

```ts
import { wagmiConfig } from "@/lib/wagmi";
```

- Chaîne : **Base Sepolia** (chainId 84532)
- Connector unique : **WalletConnect v2**
- Transport RPC : `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL`
- Le `wagmiConfig` est exporté et consommé directement dans `useWalletAuth` et `useSignAndSend` pour les appels `waitForTransactionReceipt`

> **Pour Personne A** : ne pas créer un second `wagmiConfig`. Utiliser celui de `@/lib/wagmi`.

---

## 2. Store auth (Zustand)

**Fichier :** `lib/store.ts`

```ts
import { useAppStore } from "@/lib/store";

const { userId, jwt, setAuth, clearAuth } = useAppStore();
```

| Champ / Action | Type | Description |
|---|---|---|
| `userId` | `string \| null` | ID utilisateur reçu après `/auth/verify` |
| `jwt` | `string \| null` | JWT Bearer à envoyer sur toutes les requêtes protégées |
| `setAuth(userId, jwt)` | fonction | Appelée automatiquement après connexion wallet |
| `clearAuth()` | fonction | Appelée automatiquement lors du disconnect |

- Persisté dans `localStorage` sous la clé `"phntm-auth"`
- À lire pour savoir si l'utilisateur est authentifié avant d'afficher l'UI

---

## 3. useWalletAuth

**Fichier :** `hooks/useWalletAuth.ts`

```ts
import { useWalletAuth } from "@/hooks/useWalletAuth";

const { connect, disconnect, isConnecting, isConnected, address, error } = useWalletAuth();
```

### Retour

| Propriété | Type | Description |
|---|---|---|
| `connect` | `() => Promise<void>` | Ouvre le modal WalletConnect, signe le nonce, stocke le JWT |
| `disconnect` | `() => void` | Déconnecte wagmi + vide le store Zustand |
| `isConnecting` | `boolean` | `true` pendant toute la séquence connect → verify |
| `isConnected` | `boolean` | `true` si le wallet est connecté (état wagmi) |
| `address` | `` `0x${string}` \| undefined `` | Adresse connectée |
| `error` | `string \| null` | Message d'erreur en français (voir ci-dessous) |

### Messages d'erreur possibles

| Valeur | Cause |
|---|---|
| `"Serveur indisponible"` | `/auth/nonce` ou `/auth/verify` retourne non-2xx |
| `"Signature refusée"` | L'utilisateur a refusé de signer dans le wallet |
| `"Connexion échouée"` | Erreur inattendue au niveau du connect wagmi |
| `null` | Pas d'erreur, ou l'utilisateur a fermé le modal (silencieux) |

### Séquence interne

```
connectAsync()  →  GET /auth/nonce?address=  →  signMessageAsync(nonce)  →  POST /auth/verify  →  setAuth(userId, jwt)
```

---

## 4. useSignAndSend

**Fichier :** `hooks/useSignAndSend.ts`

```ts
import { useSignAndSend, SendParams } from "@/hooks/useSignAndSend";

const { send, isLoading, txHash, txId, error } = useSignAndSend();
```

### SendParams

```ts
interface SendParams {
  to: string;           // adresse de destination (0x...)
  amount: bigint;       // montant en unités de base (wei pour ETH, 6 décimales pour USDC)
  tokenSymbol: "ETH" | "USDC";
  mode: "public" | "private";
  paymentId: string;    // ID du paiement côté backend (pour settle)
}
```

### Retour

| Propriété | Type | Description |
|---|---|---|
| `send(params)` | `(SendParams) => Promise<void>` | Déclenche la transaction |
| `isLoading` | `boolean` | `true` pendant toute la séquence |
| `txHash` | `string \| null` | Hash on-chain (mode public uniquement, après confirmation) |
| `txId` | `string \| null` | ID de transaction Unlink (mode private uniquement) |
| `error` | `string \| null` | Message d'erreur en français |

### Mode `"public"`

1. Si `tokenSymbol === "USDC"` : appel ERC-20 `transfer(to, amount)` sur le contrat USDC Base Sepolia (`0x036CbD53842c5426634e7929541eC2318f3dCF7e`)
2. Si `tokenSymbol === "ETH"` : `sendTransaction({ to, value: amount })`
3. Attend la confirmation on-chain (`waitForTransactionReceipt`)
4. Appelle `PATCH /payments/:paymentId/settle` avec le `txHash`

### Mode `"private"`

1. `GET /users/unlink-address?address={to}` → récupère `unlinkAddress`
2. `POST /payments/private/transfer` avec `{ unlinkAddress, amount: amount.toString(), token: tokenSymbol, paymentId }`
3. Stocke le `txId` retourné dans le state

### Messages d'erreur possibles

| Valeur | Cause |
|---|---|
| `"Non authentifié"` | JWT absent du store |
| `"Transaction annulée"` | L'utilisateur a rejeté dans le wallet (mode public) |
| `"Fonds insuffisants pour les frais"` | Solde ETH insuffisant pour les gas (mode public) |
| `"Transaction échouée"` | Revert ou erreur réseau (mode public) |
| `"Destinataire non enregistré"` | `/users/unlink-address` retourne null (mode private) |
| `"Transfert privé échoué"` | `/payments/private/transfer` retourne non-2xx (mode private) |

> **Pour Personne A** : appeler `send()` au clic sur "Payer". Afficher `isLoading` pendant l'attente, `txHash` ou `txId` en succès, `error` en échec.  
> **Pour Personne B** : `paymentId` est généré par le backend avant que le frontend appelle `send()`. Il doit être transmis à Personne A qui le passe à ce hook.

---

## 5. ENS hooks

**Fichier :** `hooks/useEnsResolution.ts`  
Toutes les résolutions passent par le backend (pas de résolution viem directe).  
Cache mémoire 5 minutes sur `useEnsName` et `useEnsAddress`.

---

### useEnsResolution

```ts
const { resolveEns, loading, error } = useEnsResolution();
const result = await resolveEns("alice.eth");
// result: { ensName: "alice.eth", address: "0x..." } | null
```

Usage bas niveau — préférer `useEnsAddress` pour un usage simple.

---

### useEnsName (résolution inverse)

```ts
const { resolve, ensName, loading, error } = useEnsName("0x1234...abcd");
await resolve();
// ensName: "alice.eth" | null
```

- Entrée : adresse `0x`
- Sortie : nom ENS ou `null`
- Utilisé pour **afficher le nom dans le feed** à partir d'une adresse

---

### useEnsAddress (résolution directe)

```ts
const { resolve, ensAddress, loading, error } = useEnsAddress("alice.eth");
await resolve();
// ensAddress: "0x1234...abcd" | null
```

- Entrée : nom ENS
- Sortie : adresse `0x` ou `null`
- Utilisé pour **résoudre l'alias dans `/pay/[alias]`** avant d'appeler `send()`

---

## 6. usePaymentLink / useQRCode

**Fichier :** `hooks/usePaymentLink.ts`

### usePaymentLink

```ts
import { usePaymentLink } from "@/hooks/usePaymentLink";

const { paymentLink } = usePaymentLink("alice.eth");
// paymentLink: "https://phntm.app/pay/alice.eth"
// (en dev: "http://localhost:3000/pay/alice.eth")
```

- Entrée : ENS name ou adresse `0x`
- Retourne l'URL complète du lien de paiement (adapté à `window.location.origin`)
- Aucun appel réseau, aucun state — synchrone

### useQRCode

```ts
import { useQRCode } from "@/hooks/usePaymentLink";

const { qrCodeUrl, isLoading } = useQRCode(paymentLink);
// qrCodeUrl: "data:image/png;base64,..." | null
```

- Entrée : n'importe quelle string (typiquement le résultat de `usePaymentLink`)
- Retourne un data URL PNG 256×256 prêt pour un `<img src>`
- `isLoading: true` pendant la génération

---

## 7. Variables d'environnement

Fichier : `apps/frontend/.env.local`

| Variable | Valeur par défaut | Usage |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | — (obligatoire) | Connexion WalletConnect |
| `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL` | `https://sepolia.base.org` | Transport wagmi |
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:3000` | Toutes les requêtes backend |

> **Important** : `NEXT_PUBLIC_BACKEND_URL` est la seule variable pour le backend. Ne pas utiliser `NEXT_PUBLIC_API_URL`.

---

## 8. Endpoints backend requis (Personne B)

Ces endpoints sont appelés par les hooks. Tous les endpoints sauf `/auth/*` requièrent `Authorization: Bearer <jwt>`.

| Méthode | Path | Params | Réponse attendue |
|---|---|---|---|
| `GET` | `/auth/nonce` | `?address=0x...` | `{ nonce: string }` |
| `POST` | `/auth/verify` | `{ address, signature, nonce }` | `{ jwt: string, userId: string }` |
| `PATCH` | `/payments/:id/settle` | `{ txHash: string }` | `2xx` |
| `GET` | `/users/unlink-address` | `?address=0x...` | `{ unlinkAddress: string \| null }` |
| `POST` | `/payments/private/transfer` | `{ unlinkAddress, amount: string, token, paymentId }` | `{ txId: string }` |
| `POST` | `/ens/resolve` | `{ ensName: string }` | `{ ensName: string, address: string \| null }` |
| `POST` | `/ens/reverse` | `{ address: string }` | `{ ensName: string \| null }` |

---

## 9. Contrat avec Personne C (Unlink)

Le mode `"private"` de `useSignAndSend` délègue entièrement au backend.  
Ce que Personne D attend :

1. `GET /users/unlink-address?address={to}` retourne une `unlinkAddress` intermédiaire — **c'est Personne B/C qui gère la résolution**
2. `POST /payments/private/transfer` accepte `{ unlinkAddress, amount, token, paymentId }` et retourne `{ txId }`
3. La transaction on-chain **n'est pas émise côté frontend** en mode private — tout passe par le backend

> Personne D n'a pas accès au SDK Unlink directement. Le frontend est agnostique au mécanisme de privacy.
