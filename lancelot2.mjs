import "dotenv/config";
import { createUnlink, unlinkAccount, unlinkEvm } from "@unlink-xyz/sdk";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const ENGINE_URL = "https://staging-api.unlink.xyz";

const {
  EVM_PRIVATE_KEY,
  RPC_URL,
  UNLINK_API_KEY,
  UNLINK_MNEMONIC,
  UNLINK_TOKEN,
  UNLINK_AMOUNT,
  UNLINK_POLL_TX_ID,
} = process.env;

if (!EVM_PRIVATE_KEY || !EVM_PRIVATE_KEY.startsWith("0x")) {
  throw new Error("Missing or invalid EVM_PRIVATE_KEY");
}

if (!RPC_URL) {
  throw new Error("Missing RPC_URL");
}

if (!UNLINK_API_KEY) {
  throw new Error("Missing UNLINK_API_KEY");
}

if (!UNLINK_MNEMONIC) {
  throw new Error("Missing UNLINK_MNEMONIC");
}

async function main() {
  const evmAccount = privateKeyToAccount(
    /** @type {`0x${string}`} */ (EVM_PRIVATE_KEY),
  );

  const walletClient = createWalletClient({
    account: evmAccount,
    chain: baseSepolia,
    transport: http(RPC_URL),
  });

  const unlink = createUnlink({
    engineUrl: ENGINE_URL,
    apiKey: UNLINK_API_KEY,
    account: unlinkAccount.fromMnemonic({ mnemonic: UNLINK_MNEMONIC }),
    evm: unlinkEvm.fromViem({ walletClient }),
  });

  await unlink.ensureRegistered();
  const unlinkAddress = await unlink.getAddress();

  console.log("Unlink account ready:", unlinkAddress);
  console.log("EVM signer address:", evmAccount.address);

  // ─── Solde actuel ──────────────────────────────────────────────────────────
  console.log("\nSolde Unlink actuel...");
  try {
    const { balances } = await unlink.getBalances();
    if (!balances || balances.length === 0) {
      console.log("  Solde : vide (aucun token shieldé trouvé)");
    } else {
      for (const b of balances) {
        console.log(`  ${b.token_address} : ${b.balance}`);
      }
    }
  } catch (err) {
    console.warn("  getBalances échoué :", err.message);
  }

  // ─── Poll d'un transfert en cours ─────────────────────────────────────────
  if (UNLINK_POLL_TX_ID) {
    console.log(`\nPoll du transfert ${UNLINK_POLL_TX_ID}...`);
    try {
      const result = await unlink.pollTransactionStatus(UNLINK_POLL_TX_ID, {
        intervalMs: 3000,
        timeoutMs: 60000,
      });
      console.log("  Status final :", result.status);
    } catch (err) {
      console.warn("  Poll échoué :", err.message);
    }
  }

  if (!UNLINK_TOKEN || !UNLINK_AMOUNT) {
    console.log("\nPour déposer : ajoute UNLINK_TOKEN et UNLINK_AMOUNT dans .env");
    return;
  }

  console.log("Checking/setting token approval...");
  const approval = await unlink.ensureErc20Approval({
    token: UNLINK_TOKEN,
    amount: UNLINK_AMOUNT,
  });

  console.log("Approval status:", approval.status);
  if (approval.status === "submitted") {
    console.log("Approval tx hash:", approval.txHash);
  }

  console.log("Submitting Unlink deposit...");
  const depositTx = await unlink.deposit({
    token: UNLINK_TOKEN,
    amount: UNLINK_AMOUNT,
  });

  console.log("Deposit txId:", depositTx.txId);
  const settled = await unlink.pollTransactionStatus(depositTx.txId, {
    intervalMs: 3000,
    timeoutMs: 180000,
  });
  console.log("Deposit final status:", settled.status);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});