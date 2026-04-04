import "dotenv/config";
import { createUnlink, unlinkAccount, unlinkEvm } from "@unlink-xyz/sdk";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const ENGINE_URL = "https://staging-api.unlink.xyz";

const {
  EVM_PRIVATE_KEY,
  RPC_URL,
  UNLINK_API_KEY,
  UNLINK_TOKEN,
  UNLINK_AMOUNT,
  PHRASE1,
  PHRASE2,
  PHRASE3,
  PHRASE4,
  PHRASE5,
} = process.env;

// --- Validation ---
if (!EVM_PRIVATE_KEY || !EVM_PRIVATE_KEY.startsWith("0x"))
  throw new Error("Missing or invalid EVM_PRIVATE_KEY");
if (!RPC_URL) throw new Error("Missing RPC_URL");
if (!UNLINK_API_KEY) throw new Error("Missing UNLINK_API_KEY");
if (!UNLINK_TOKEN) throw new Error("Missing UNLINK_TOKEN");
if (!UNLINK_AMOUNT) throw new Error("Missing UNLINK_AMOUNT");

// --- Clients viem (partagés, même EVM pour tous) ---
const evmAccount = privateKeyToAccount(EVM_PRIVATE_KEY);

const walletClient = createWalletClient({
  account: evmAccount,
  chain: baseSepolia,
  transport: http(RPC_URL),
});

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

// ================================================================
// Factory : crée un client Unlink à partir d'une phrase
// ================================================================
function createUnlinkClient(mnemonic) {
  return createUnlink({
    engineUrl: ENGINE_URL,
    apiKey: UNLINK_API_KEY,
    account: unlinkAccount.fromMnemonic({ mnemonic }),
    evm: unlinkEvm.fromViem({ walletClient, publicClient }),
  });
}

// ================================================================
// Fonction 1 : Deposit EVM → Privacy Pool
// ================================================================
async function deposit(unlink, token, amount) {
  console.log("  Checking ERC-20 approval...");
  const approval = await unlink.ensureErc20Approval({ token, amount });

  if (approval.status === "submitted") {
    console.log("  Approval tx submitted, waiting...");
    await publicClient.waitForTransactionReceipt({ hash: approval.txHash });
    console.log("  Approval confirmed.");
  } else {
    console.log("  Already approved, skipping.");
  }

  console.log(`  Depositing ${amount} of ${token}...`);
  const result = await unlink.deposit({ token, amount });
  console.log("  Deposit submitted, txId:", result.txId);

  const confirmed = await unlink.pollTransactionStatus(result.txId);
  console.log("  Transaction confirmed:", confirmed);

  return confirmed;
}

// ================================================================
// Fonction 2 : Balance dans la privacy pool
// ================================================================
async function getBalance(unlink, token) {
  const { balances } = await unlink.getBalances({ token });

  if (!balances || balances.length === 0) {
    console.log("  No balance found.");
    return "0";
  }

  const balance = balances[0];
  const readableAmount = (BigInt(balance.amount) / 10n ** 18n).toString();
  console.log(`  Token  : ${balance.token}`);
  console.log(`  Amount : ${readableAmount} (${balance.amount} wei)`);

  return balance.amount;
}

async function transfer(mnemonicSender, mnemonicRecipient, token, amount) {
  const unlinkSender = createUnlinkClient(mnemonicSender);
  const unlinkRecipient = createUnlinkClient(mnemonicRecipient);

  const recipientAddress = await unlinkRecipient.getAddress();
  console.log(`  Recipient address : ${recipientAddress}`);

  console.log(`  Transferring ${amount} wei of ${token}...`);
  const result = await unlinkSender.transfer({
    recipientAddress,
    token,
    amount,
  });

  console.log("  Transfer submitted, txId:", result.txId);
  const confirmed = await unlinkSender.pollTransactionStatus(result.txId);
  console.log("  Transfer confirmed:", confirmed);

  return confirmed;
}

// ================================================================
// Main
// ================================================================
const phrases = [PHRASE1, PHRASE2, PHRASE3, PHRASE4, PHRASE5].filter(Boolean);

for (let i = 0; i < phrases.length; i++) {
  
  const phrase = phrases[i];
  console.log(`\n--- Phrase ${i + 1} ---`);

  const unlink = createUnlinkClient(phrase);
  const address = await unlink.getAddress();
  console.log(`  Unlink address : ${address}`);
  if(false)
  {
    await deposit(unlink, UNLINK_TOKEN, UNLINK_AMOUNT);
  }
  await getBalance(unlink, UNLINK_TOKEN);
}



//Test de transfer
/*
for(let i in [0, 1])
{
  const phrase = phrases[i];
  console.log(`\n--- Phrase ${i + 1} ---`);

  const unlink = createUnlinkClient(phrase);
  const address = await unlink.getAddress();
  console.log(`  Unlink address : ${address}`);
  await getBalance(unlink, UNLINK_TOKEN);
}
console.log("\n--- Transfer from Phrase 1 to Phrase 2 ---");
await transfer(PHRASE1, PHRASE2, UNLINK_TOKEN, UNLINK_AMOUNT)
console.log("\n--- After Transfer ---");

for(let i in [0, 1])
{
  const phrase = phrases[i];
  console.log(`\n--- Phrase ${i + 1} ---`);

  const unlink = createUnlinkClient(phrase);
  const address = await unlink.getAddress();
  console.log(`  Unlink address : ${address}`);
  await getBalance(unlink, UNLINK_TOKEN);
}*/




//PERMET DE CREER des phrases random
/*
import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

for (let i = 1; i <= 5; i++) {
  console.log(`PHRASE${i}="${generateMnemonic(wordlist, 128)}"`);
}
  */