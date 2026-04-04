import { BadRequestException } from "@nestjs/common";

import { PaymentsService } from "../src/modules/payments/payments.service";

describe("PaymentsService", () => {
  const paymentsRepository = {
    createTransaction: jest.fn()
  } as any;

  const service = new PaymentsService(paymentsRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a payment when sender and recipient differ", async () => {
    paymentsRepository.createTransaction.mockResolvedValue({ id: "tx-1" });

    const result = await service.createPayment({
      senderUserId: "de305d54-75b4-431b-adb2-eb6b9e546014",
      recipientUserId: "123e4567-e89b-12d3-a456-426614174000",
      amount: 5,
      tokenSymbol: "USDC",
      note: "Lunch",
      mode: "PUBLIC" as const
    });

    expect(result).toEqual({ id: "tx-1" });
    expect(paymentsRepository.createTransaction).toHaveBeenCalledTimes(1);
  });

  it("rejects self-payments", async () => {
    await expect(
      service.createPayment({
        senderUserId: "de305d54-75b4-431b-adb2-eb6b9e546014",
        recipientUserId: "de305d54-75b4-431b-adb2-eb6b9e546014",
        amount: 5,
        tokenSymbol: "USDC",
        mode: "PUBLIC" as const
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
