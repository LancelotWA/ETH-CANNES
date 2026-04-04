"use client";

import { useState } from "react";
import { useWriteContract, useSendTransaction } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { useAppStore } from "@/lib/store";

const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

const ERC20_TRANSFER_ABI = [
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
] as const;

export interface SendParams {
  to: string;
  amount: bigint;
  tokenSymbol: "ETH" | "USDC";
  mode: "public" | "private";
  paymentId: string;
}

interface UseSignAndSendReturn {
  send: (params: SendParams) => Promise<void>;
  isLoading: boolean;
  txHash: string | null;
  txId: string | null;
  error: string | null;
}

function classifyPublicError(err: unknown): string {
  const message = err instanceof Error ? err.message.toLowerCase() : "";
  if (
    message.includes("rejected") ||
    message.includes("user denied") ||
    message.includes("user rejected")
  ) {
    return "Transaction annulée";
  }
  if (
    message.includes("insufficient funds") ||
    message.includes("insufficient balance")
  ) {
    return "Fonds insuffisants pour les frais";
  }
  return "Transaction échouée";
}

async function settle(paymentId: string, txHash: string, jwt: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/payments/${paymentId}/settle`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ txHash }),
  });
  if (!res.ok) throw new Error(`settle failed: ${res.status}`);
}

export function useSignAndSend(): UseSignAndSendReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const { jwt } = useAppStore();

  async function sendPublic(
    to: string,
    amount: bigint,
    tokenSymbol: "ETH" | "USDC",
    paymentId: string,
    authJwt: string,
  ): Promise<void> {
    let hash: `0x${string}`;

    if (tokenSymbol === "USDC") {
      hash = await writeContractAsync({
        address: USDC_BASE_SEPOLIA,
        abi: ERC20_TRANSFER_ABI,
        functionName: "transfer",
        args: [to as `0x${string}`, amount],
      });
    } else {
      hash = await sendTransactionAsync({
        to: to as `0x${string}`,
        value: amount,
      });
    }

    setTxHash(hash);
    await waitForTransactionReceipt(wagmiConfig, { hash });
    await settle(paymentId, hash, authJwt);
  }

  async function sendPrivate(
    to: string,
    amount: bigint,
    tokenSymbol: "ETH" | "USDC",
    paymentId: string,
    authJwt: string,
  ): Promise<void> {
    const unlinkRes = await fetch(
      `${BACKEND_URL}/users/unlink-address?address=${to}`,
      { headers: { Authorization: `Bearer ${authJwt}` } },
    );
    if (!unlinkRes.ok) {
      throw new Error("Destinataire non enregistré");
    }
    const { unlinkAddress } = await unlinkRes.json();
    if (!unlinkAddress) {
      throw new Error("Destinataire non enregistré");
    }

    const transferRes = await fetch(`${BACKEND_URL}/payments/private/transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authJwt}`,
      },
      body: JSON.stringify({
        unlinkAddress,
        amount: amount.toString(),
        token: tokenSymbol,
        paymentId,
      }),
    });
    if (!transferRes.ok) {
      throw new Error("Transfert privé échoué");
    }
    const { txId: returnedTxId } = await transferRes.json();
    setTxId(returnedTxId);
  }

  async function send(params: SendParams): Promise<void> {
    const { to, amount, tokenSymbol, mode, paymentId } = params;

    setIsLoading(true);
    setTxHash(null);
    setTxId(null);
    setError(null);

    try {
      if (!jwt) {
        setError("Non authentifié");
        return;
      }

      if (mode === "public") {
        await sendPublic(to, amount, tokenSymbol, paymentId, jwt);
      } else {
        await sendPrivate(to, amount, tokenSymbol, paymentId, jwt);
      }
    } catch (err) {
      if (mode === "private") {
        const message = err instanceof Error ? err.message : "";
        setError(
          message === "Destinataire non enregistré" ||
          message === "Transfert privé échoué"
            ? message
            : "Transfert privé échoué",
        );
      } else {
        setError(classifyPublicError(err));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return { send, isLoading, txHash, txId, error };
}
