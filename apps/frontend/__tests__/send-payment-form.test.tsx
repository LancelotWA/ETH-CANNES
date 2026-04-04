import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SendPaymentForm } from "@/components/payments/send-payment-form";

vi.mock("@/hooks/useEnsResolution", () => ({
  useEnsResolution: () => ({
    resolveEns: vi.fn().mockResolvedValue("0x123" as `0x${string}`),
    lookupAddress: vi.fn().mockResolvedValue("alice.eth"),
    loading: false,
    error: null
  })
}));

describe("SendPaymentForm", () => {
  it("renders with sender address", () => {
    render(<SendPaymentForm senderAddress={"0xde305d54" as `0x${string}`} />);
    expect(screen.getByText(/Send payment/i)).toBeInTheDocument();
    expect(screen.getByText(/0xde305d54/i)).toBeInTheDocument();
  });
});
