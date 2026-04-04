import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SendPaymentForm } from "@/components/payments/send-payment-form";

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: "0xde305d54" as `0x${string}` }),
  useSendTransaction: () => ({ sendTransactionAsync: vi.fn() }),
  useWriteContract: () => ({ writeContractAsync: vi.fn() }),
}));

vi.mock("@/lib/wagmi", () => ({
  wagmiConfig: {},
}));

describe("SendPaymentForm", () => {
  it("renders token selector and send button", () => {
    render(<SendPaymentForm />);
    expect(screen.getByText("ETH")).toBeInTheDocument();
    expect(screen.getByText("USDC")).toBeInTheDocument();
    expect(screen.getByText("SEND")).toBeInTheDocument();
  });
});
