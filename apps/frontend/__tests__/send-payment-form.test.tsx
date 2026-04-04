import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SendPaymentForm } from "@/components/payments/send-payment-form";

vi.mock("@/hooks/useEnsResolution", () => ({
  useEnsResolution: () => ({
    resolveEns: vi.fn().mockResolvedValue({ ensName: "alice.eth", address: "0x123" }),
    loading: false,
    error: null
  })
}));

vi.mock("@/lib/api", () => ({
  postJson: vi.fn().mockResolvedValue({ id: "tx-1" })
}));

describe("SendPaymentForm", () => {
  it("submits payment flow", async () => {
    render(<SendPaymentForm senderUserId="de305d54-75b4-431b-adb2-eb6b9e546014" />);

    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText(/Payment queued/i)).toBeInTheDocument();
  });
});
