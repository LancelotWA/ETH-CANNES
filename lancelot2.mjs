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
async function getBalance(unlinkOrAddress, token) {
  let balances;

  if (typeof unlinkOrAddress === "string") {
    // adresse Unlink directe — on utilise l'API bas niveau via un client anonyme
    const { getUser, createUnlink: cu, unlinkAccount: ua } = await import("@unlink-xyz/sdk");
    const tempClient = cu({
      engineUrl: ENGINE_URL,
      apiKey: UNLINK_API_KEY,
      account: ua.fromMnemonic({ mnemonic: PHRASE5 }),
    });
    const user = await getUser(tempClient.client, unlinkOrAddress);
    balances = user?.balances ?? [];
  } else {
    ({ balances } = await unlinkOrAddress.getBalances({ token }));
  }

  if (!balances || balances.length === 0) {
    console.log("  No balance found.");
    return "0";
  }

  for (const balance of balances) {
    const readableAmount = (BigInt(balance.amount) / 10n ** 18n).toString();
    console.log(`  Token  : ${balance.token}`);
    console.log(`  Amount : ${readableAmount} (${balance.amount} wei)`);
  }

  return balances[0].amount;
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
// Fonction : Deposit + Transfer vers une adresse Unlink cible
// Le deposit Unlink dépose toujours vers son propre compte (PHRASE5),
// puis un transfer intra-pool envoie vers l'adresse cible.
// ================================================================
async function depositToAddress(senderMnemonic, targetUnlinkAddress, token, amount) {
  const unlink = createUnlinkClient(senderMnemonic);

  const senderAddress = await unlink.getAddress();
  console.log(`  Sender Unlink address : ${senderAddress}`);
  console.log(`  Target Unlink address : ${targetUnlinkAddress}`);

  // Étape 1 : deposit EVM → pool (vers son propre compte Unlink)
  console.log("\n  [1/2] Depositing into own Unlink account...");
  const approval = await unlink.ensureErc20Approval({ token, amount });
  if (approval.status === "submitted") {
    console.log("  Approval tx submitted, waiting...");
    await publicClient.waitForTransactionReceipt({ hash: approval.txHash });
    console.log("  Approval confirmed.");
  } else {
    console.log("  Already approved.");
  }

  const depositResult = await unlink.deposit({ token, amount });
  console.log("  Deposit submitted, txId:", depositResult.txId);
  const depositConfirmed = await unlink.pollTransactionStatus(depositResult.txId);
  console.log("  Deposit confirmed:", depositConfirmed);

  // Étape 2 : transfer intra-pool vers l'adresse cible
  console.log("\n  [2/2] Transferring to target Unlink address...");
  const transferResult = await unlink.transfer({ recipientAddress: targetUnlinkAddress, token, amount });
  console.log("  Transfer submitted, txId:", transferResult.txId);
  const transferConfirmed = await unlink.pollTransactionStatus(transferResult.txId);
  console.log("  Transfer confirmed:", transferConfirmed);

  return transferConfirmed;
}

// ================================================================
// Main
// ================================================================
/*
await depositToAddress(
  PHRASE2,
  "unlink1qqka8k55lrq8qpq05rfkwrpp9kyww2t73lue048cfrgxyzlv3sl0pvsuajj3r8wwy8s3mlfq3qf2txc7xl3c2tdl35zq6pyh6y76jhhgyvv458",
  UNLINK_TOKEN,
  UNLINK_AMOUNT,
);*/

await getBalance("unlink1qqw8fqcsvtxf6vsnwaxg4s7ftck4n38awggh732ghn6wm927sv6f3hd9347nxmzyyzc69ga6p5lyrmt2m2g9s90qjr79gh3amn76mtg4x8t9g7", UNLINK_TOKEN);



const phrases = [PHRASE1, PHRASE2, PHRASE3, PHRASE4, PHRASE5];

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
  

/*


//Test de transfer

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