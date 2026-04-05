"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useBalance, useSendTransaction, useWriteContract } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { motion } from "framer-motion";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { Wallet, ArrowDown, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";

const TOKENS = [
  { symbol: "ETH", label: "Base Sepolia ETH" },
] as const;

type TokenSymbol = (typeof TOKENS)[number]["symbol"];

const UNLINK_TOKEN = "0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7" as const;

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export default function DepositPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const activeUserId = useAppStore((s) => s.activeUserId);
  const authToken = useAppStore((s) => s.authToken);

  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<TokenSymbol>("ETH");
  const [status, setStatus] = useState<"idle" | "funding" | "depositing" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const ETH_PRICE = 3500;
  const ethAmt = balance ? Number(balance.value) / 10 ** balance.decimals : 0;
  const formattedEth = ethAmt.toFixed(4);
  const formattedUsd = (ethAmt * ETH_PRICE).toFixed(2);
  const shortAddr = address ? `${address.slice(0, 6)}···${address.slice(-4)}` : "";

  const canDeposit = Number(amount) > 0 && status !== "funding" && status !== "depositing";

  async function handleDeposit() {
    if (!canDeposit || !activeUserId || !address) return;
    setError(null);

    try {
      // Step 1: Ensure Unlink account exists and get the derived EVM address
      setStatus("funding");
      const { evmAddress } = await api.post<{ unlinkAddress: string; evmAddress: string; registered: boolean }>(
        "/unilink/account",
        { userId: activeUserId },
        authToken,
      );

      const amountWei = parseUnits(amount, 18);

      // Step 2a: Send ETH for gas fees to the derived wallet
      const gasBuffer = parseEther("0.005");
      const gasHash = await sendTransactionAsync({
        to: evmAddress as `0x${string}`,
        value: gasBuffer,
      });
      await waitForTransactionReceipt(wagmiConfig as never, { hash: gasHash });

      // Step 2b: Mint test tokens directly to the derived wallet
      const mintHash = await writeContractAsync({
        address: UNLINK_TOKEN,
        abi: ERC20_ABI,
        functionName: "mint",
        args: [evmAddress as `0x${string}`, amountWei],
      });
      await waitForTransactionReceipt(wagmiConfig as never, { hash: mintHash });

      // Step 3: Call backend to do the pool deposit (approval + deposit via SDK)
      setStatus("depositing");
      await api.post(
        "/unilink/deposit",
        {
          userId: activeUserId,
          token: UNLINK_TOKEN,
          amount: amountWei.toString(),
        },
        authToken,
      );

      setStatus("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : "";
      if (msg.includes("rejected") || msg.includes("denied")) {
        setError("Transaction cancelled");
      } else {
        setError(err instanceof Error ? err.message : "Deposit failed");
      }
      setStatus("error");
    }
  }

  const statusLabel =
    status === "funding"
      ? "SENDING TO UNLINK WALLET..."
      : status === "depositing"
        ? "DEPOSITING INTO POOL..."
        : status === "success"
          ? "DEPOSITED !"
          : "DEPOSIT";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center w-full pt-4 pb-28 px-4 max-w-md mx-auto"
    >
      <button
        onClick={() => router.back()}
        className="self-start flex items-center gap-1.5 mb-3 text-xs font-sans transition-opacity hover:opacity-60"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={16} />
        Back
      </button>
      <div
        className="w-full rounded-[24px] p-5 flex flex-col gap-5"
        style={{
          background: "rgba(255,255,255,0.005)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        <h1
          className="text-2xl font-bold tracking-tight text-center"
          style={{ color: "var(--text)" }}
        >
          <DecryptedText text="DEPOSIT" animateOn="view" speed={100} sequential />
        </h1>

        <p
          className="text-xs text-center font-sans"
          style={{ color: "var(--text-muted)" }}
        >
          Deposit tokens into the Unlink privacy pool
        </p>

        {/* Wallet info */}
        <div
          className="flex items-center justify-between rounded-[14px] px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center gap-2">
            <Wallet size={14} style={{ color: "var(--accent)" }} />
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              {shortAddr}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold" style={{ color: "var(--text)" }}>
              {formattedEth} ETH
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              ${formattedUsd}
            </p>
          </div>
        </div>

        {/* Token selector */}
        <div>
          <p
            className="text-[11px] font-semibold tracking-widest uppercase mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Token
          </p>
          <div className="flex flex-wrap gap-2">
            {TOKENS.map((t) => (
              <button
                key={t.symbol}
                type="button"
                onClick={() => setToken(t.symbol)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: token === t.symbol ? "var(--accent)" : "rgba(255,255,255,0.06)",
                  color: token === t.symbol ? "#fff" : "var(--text-muted)",
                  border: `1px solid ${token === t.symbol ? "transparent" : "rgba(255,255,255,0.1)"}`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <p
            className="text-[11px] font-semibold tracking-widest uppercase mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Amount
          </p>
          <input
            type="number"
            min="0"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-[12px] px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--text)",
            }}
          />
        </div>

        {/* Arrow indicator */}
        <div className="flex justify-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.3)",
            }}
          >
            <ArrowDown size={18} color="#A78BFA" />
          </div>
        </div>

        <p
          className="text-xs text-center font-mono"
          style={{ color: "#A78BFA" }}
        >
          Unlink Privacy Pool
        </p>

        {/* Submit */}
        <button
          onClick={handleDeposit}
          disabled={!canDeposit}
          className="w-full py-3.5 rounded-[14px] text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background:
              status === "success"
                ? "#10b981"
                : canDeposit
                  ? "linear-gradient(135deg,#7C3AED,#6366F1)"
                  : "rgba(255,255,255,0.06)",
            color: canDeposit || status === "success" ? "#fff" : "var(--text-subtle)",
            opacity: canDeposit || status === "success" ? 1 : 0.5,
            boxShadow: canDeposit ? "0 4px 16px rgba(124,58,237,0.3)" : "none",
          }}
        >
          {statusLabel}
        </button>

        {error && (
          <p className="text-xs text-center font-semibold" style={{ color: "#ef4444" }}>
            {error}
          </p>
        )}
        {status === "success" && (
          <p className="text-xs text-center font-semibold" style={{ color: "#10b981" }}>
            Deposit confirmed
          </p>
        )}
      </div>
    </motion.div>
  );
}
