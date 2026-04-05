import { UnilinkController } from "../src/modules/unilink/unilink.controller";

// ─── Mock SDK & viem (required because controller imports service which imports SDK) ──

jest.mock("@unlink-xyz/sdk", () => ({
  createUnlink: jest.fn(),
  unlinkAccount: { fromMnemonic: jest.fn() },
  unlinkEvm: { fromViem: jest.fn() },
}));

jest.mock("viem", () => ({
  createPublicClient: jest.fn(),
  createWalletClient: jest.fn(),
  http: jest.fn(),
}));

jest.mock("viem/chains", () => ({
  baseSepolia: { id: 84532, name: "Base Sepolia" },
}));

jest.mock("viem/accounts", () => ({
  mnemonicToAccount: jest.fn(),
  generateMnemonic: jest.fn(() => "mock mnemonic"),
  english: [],
}));

// ─── Mock service ─────────────────────────────────────────────────────────────

function buildController(serviceOverrides: Record<string, jest.Mock> = {}) {
  const service = {
    getOrCreateAccount: jest.fn(),
    getBalances: jest.fn(),
    deposit: jest.fn(),
    transfer: jest.fn(),
    withdraw: jest.fn(),
    getTransactions: jest.fn(),
    ...serviceOverrides,
  } as any;

  const controller = new UnilinkController(service);
  return { controller, service };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SENDER_ID = "de305d54-75b4-431b-adb2-eb6b9e546014";
const RECIPIENT_ID = "123e4567-e89b-12d3-a456-426614174000";
const TOKEN = "0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("UnilinkController", () => {
  describe("POST /account", () => {
    it("delegates to service.getOrCreateAccount with userId", async () => {
      const { controller, service } = buildController({
        getOrCreateAccount: jest.fn().mockResolvedValue({
          unlinkAddress: "unlink1abc",
          registered: true,
        }),
      });

      const result = await controller.createAccount({ userId: SENDER_ID });

      expect(service.getOrCreateAccount).toHaveBeenCalledWith(SENDER_ID);
      expect(result).toEqual({ unlinkAddress: "unlink1abc", registered: true });
    });
  });

  describe("GET /balance/:userId", () => {
    it("delegates to service.getBalances", async () => {
      const mockBalances = { balances: [{ token: TOKEN, amount: "5000" }] };
      const { controller, service } = buildController({
        getBalances: jest.fn().mockResolvedValue(mockBalances),
      });

      const result = await controller.getBalance(SENDER_ID);

      expect(service.getBalances).toHaveBeenCalledWith(SENDER_ID);
      expect(result).toEqual(mockBalances);
    });
  });

  describe("POST /deposit", () => {
    it("delegates to service.deposit with correct params", async () => {
      const { controller, service } = buildController({
        deposit: jest.fn().mockResolvedValue({ txId: "tx-dep", status: "processed" }),
      });

      const result = await controller.deposit({
        userId: SENDER_ID,
        token: TOKEN,
        amount: "100000000",
      });

      expect(service.deposit).toHaveBeenCalledWith(SENDER_ID, TOKEN, "100000000");
      expect(result).toEqual({ txId: "tx-dep", status: "processed" });
    });
  });

  describe("POST /transfer", () => {
    it("delegates to service.transfer with correct params", async () => {
      const { controller, service } = buildController({
        transfer: jest.fn().mockResolvedValue({ txId: "tx-tr", status: "processed" }),
      });

      const result = await controller.transfer({
        senderUserId: SENDER_ID,
        recipientUnlinkAddress: "unlink1recipient",
        token: TOKEN,
        amount: "50000000",
      });

      expect(service.transfer).toHaveBeenCalledWith(
        SENDER_ID,
        "unlink1recipient",
        TOKEN,
        "50000000",
      );
      expect(result).toEqual({ txId: "tx-tr", status: "processed" });
    });
  });

  describe("POST /withdraw", () => {
    it("delegates to service.withdraw with correct params", async () => {
      const recipientEvm = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
      const { controller, service } = buildController({
        withdraw: jest.fn().mockResolvedValue({ txId: "tx-wd", status: "processed" }),
      });

      const result = await controller.withdraw({
        userId: SENDER_ID,
        recipientEvmAddress: recipientEvm,
        token: TOKEN,
        amount: "25000000",
      });

      expect(service.withdraw).toHaveBeenCalledWith(
        SENDER_ID,
        recipientEvm,
        TOKEN,
        "25000000",
      );
      expect(result).toEqual({ txId: "tx-wd", status: "processed" });
    });
  });

  describe("GET /transactions/:userId", () => {
    it("delegates to service.getTransactions with parsed limit", async () => {
      const mockTxs = { transactions: [], cursor: null };
      const { controller, service } = buildController({
        getTransactions: jest.fn().mockResolvedValue(mockTxs),
      });

      const result = await controller.getTransactions(SENDER_ID, "transfer", "20");

      expect(service.getTransactions).toHaveBeenCalledWith(SENDER_ID, "transfer", 20);
      expect(result).toEqual(mockTxs);
    });

    it("passes undefined limit when not provided", async () => {
      const mockTxs = { transactions: [], cursor: null };
      const { controller, service } = buildController({
        getTransactions: jest.fn().mockResolvedValue(mockTxs),
      });

      await controller.getTransactions(SENDER_ID, undefined, undefined);

      expect(service.getTransactions).toHaveBeenCalledWith(SENDER_ID, undefined, undefined);
    });
  });
});
