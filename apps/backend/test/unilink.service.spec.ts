import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { UnilinkService } from "../src/modules/unilink/unilink.service";

// ─── Mock the SDK and viem so tests run without network ────────────────────

const mockUnlinkClient = {
  ensureRegistered: jest.fn(),
  getAddress: jest.fn(),
  getBalances: jest.fn(),
  ensureErc20Approval: jest.fn(),
  deposit: jest.fn(),
  transfer: jest.fn(),
  withdraw: jest.fn(),
  pollTransactionStatus: jest.fn(),
  getTransactions: jest.fn(),
};

jest.mock("@unlink-xyz/sdk", () => ({
  createUnlink: jest.fn(() => mockUnlinkClient),
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
  generateMnemonic: jest.fn(() => "test word repeat twelve times for mock mnemonic phrase seed value ok"),
  english: [],
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

const SENDER_ID = "de305d54-75b4-431b-adb2-eb6b9e546014";
const RECIPIENT_ID = "123e4567-e89b-12d3-a456-426614174000";
const TOKEN = "0x7501de8ea37a21e20e6e65947d2ecab0e9f061a7";

function buildService(repoOverrides: Record<string, jest.Mock> = {}) {
  const repository = {
    getUnlinkAddress: jest.fn().mockResolvedValue(null),
    getUnlinkMnemonic: jest.fn().mockResolvedValue(null),
    setUnlinkAccount: jest.fn().mockResolvedValue(undefined),
    findUserByUnlinkAddress: jest.fn().mockResolvedValue(null),
    ...repoOverrides,
  } as any;

  const config = {
    get: jest.fn((key: string, fallback: string) => {
      if (key === "unlink.apiKey") return "test-api-key";
      if (key === "unlink.apiUrl") return "https://staging-api.unlink.xyz";
      return fallback;
    }),
  } as unknown as ConfigService;

  const service = new UnilinkService(config, repository);
  return { service, repository };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("UnilinkService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── getOrCreateAccount ──────────────────────────────────────────────────

  describe("getOrCreateAccount", () => {
    it("returns existing account if user already has an Unlink address", async () => {
      const { service } = buildService({
        getUnlinkAddress: jest.fn().mockResolvedValue("unlink1existing"),
      });

      const result = await service.getOrCreateAccount(SENDER_ID);

      expect(result).toEqual({ unlinkAddress: "unlink1existing", registered: true });
    });

    it("creates a new account if user has no Unlink address", async () => {
      mockUnlinkClient.getAddress.mockResolvedValue("unlink1new");
      mockUnlinkClient.ensureRegistered.mockResolvedValue(undefined);

      const { service, repository } = buildService();

      const result = await service.getOrCreateAccount(SENDER_ID);

      expect(result).toEqual({ unlinkAddress: "unlink1new", registered: true });
      expect(mockUnlinkClient.ensureRegistered).toHaveBeenCalled();
      expect(mockUnlinkClient.getAddress).toHaveBeenCalled();
      expect(repository.setUnlinkAccount).toHaveBeenCalledWith(
        SENDER_ID,
        expect.any(String),
        "unlink1new",
      );
    });
  });

  // ── getAddress ──────────────────────────────────────────────────────────

  describe("getAddress", () => {
    it("returns address when user has one", async () => {
      const { service } = buildService({
        getUnlinkAddress: jest.fn().mockResolvedValue("unlink1abc"),
      });

      const result = await service.getAddress(SENDER_ID);
      expect(result).toBe("unlink1abc");
    });

    it("throws NotFoundException when user has no Unlink account", async () => {
      const { service } = buildService();

      await expect(service.getAddress(SENDER_ID)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  // ── transfer ────────────────────────────────────────────────────────────

  describe("transfer", () => {
    it("rejects self-transfers", async () => {
      const { service } = buildService();

      await expect(
        service.transfer(SENDER_ID, SENDER_ID, TOKEN, "1000"),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("throws when recipient has no Unlink account", async () => {
      const { service } = buildService({
        getUnlinkMnemonic: jest.fn().mockResolvedValue("mock mnemonic words"),
      });

      await expect(
        service.transfer(SENDER_ID, RECIPIENT_ID, TOKEN, "1000"),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("executes transfer when both users have Unlink accounts", async () => {
      mockUnlinkClient.transfer.mockResolvedValue({ txId: "tx-123", status: "pending" });
      mockUnlinkClient.pollTransactionStatus.mockResolvedValue({ txId: "tx-123", status: "processed" });

      const { service } = buildService({
        getUnlinkAddress: jest.fn().mockResolvedValue("unlink1recipient"),
        getUnlinkMnemonic: jest.fn().mockResolvedValue("mock mnemonic words"),
      });

      const result = await service.transfer(SENDER_ID, RECIPIENT_ID, TOKEN, "50000000");

      expect(result).toEqual({ txId: "tx-123", status: "processed" });
      expect(mockUnlinkClient.transfer).toHaveBeenCalledWith({
        recipientAddress: "unlink1recipient",
        token: TOKEN,
        amount: "50000000",
      });
      expect(mockUnlinkClient.pollTransactionStatus).toHaveBeenCalledWith("tx-123");
    });
  });

  // ── deposit ─────────────────────────────────────────────────────────────

  describe("deposit", () => {
    it("throws when user has no Unlink account", async () => {
      const { service } = buildService();

      await expect(
        service.deposit(SENDER_ID, TOKEN, "1000"),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("approves token, deposits, and polls for confirmation", async () => {
      mockUnlinkClient.ensureErc20Approval.mockResolvedValue(undefined);
      mockUnlinkClient.deposit.mockResolvedValue({ txId: "tx-dep", status: "pending" });
      mockUnlinkClient.pollTransactionStatus.mockResolvedValue({ txId: "tx-dep", status: "processed" });

      const { service } = buildService({
        getUnlinkMnemonic: jest.fn().mockResolvedValue("mock mnemonic words"),
      });

      const result = await service.deposit(SENDER_ID, TOKEN, "100000000");

      expect(result).toEqual({ txId: "tx-dep", status: "processed" });
      expect(mockUnlinkClient.ensureErc20Approval).toHaveBeenCalledWith({ token: TOKEN, amount: "100000000" });
      expect(mockUnlinkClient.deposit).toHaveBeenCalledWith({ token: TOKEN, amount: "100000000" });
    });
  });

  // ── withdraw ────────────────────────────────────────────────────────────

  describe("withdraw", () => {
    it("throws when user has no Unlink account", async () => {
      const { service } = buildService();

      await expect(
        service.withdraw(SENDER_ID, "0x1234567890abcdef1234567890abcdef12345678", TOKEN, "1000"),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it("withdraws and polls for confirmation", async () => {
      const recipientEvm = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
      mockUnlinkClient.withdraw.mockResolvedValue({ txId: "tx-wd", status: "pending" });
      mockUnlinkClient.pollTransactionStatus.mockResolvedValue({ txId: "tx-wd", status: "processed" });

      const { service } = buildService({
        getUnlinkMnemonic: jest.fn().mockResolvedValue("mock mnemonic words"),
      });

      const result = await service.withdraw(SENDER_ID, recipientEvm, TOKEN, "5000000");

      expect(result).toEqual({ txId: "tx-wd", status: "processed" });
      expect(mockUnlinkClient.withdraw).toHaveBeenCalledWith({
        recipientEvmAddress: recipientEvm,
        token: TOKEN,
        amount: "5000000",
      });
    });
  });

  // ── getBalances ─────────────────────────────────────────────────────────

  describe("getBalances", () => {
    it("throws when user has no Unlink account", async () => {
      const { service } = buildService();

      await expect(service.getBalances(SENDER_ID)).rejects.toBeInstanceOf(NotFoundException);
    });

    it("returns balances from SDK", async () => {
      const mockBalances = { balances: [{ token: TOKEN, amount: "500" }] };
      mockUnlinkClient.getBalances.mockResolvedValue(mockBalances);

      const { service } = buildService({
        getUnlinkMnemonic: jest.fn().mockResolvedValue("mock mnemonic words"),
      });

      const result = await service.getBalances(SENDER_ID);
      expect(result).toEqual(mockBalances);
    });
  });

  // ── getTransactions ─────────────────────────────────────────────────────

  describe("getTransactions", () => {
    it("returns transaction history from SDK", async () => {
      const mockTxs = { transactions: [{ txId: "tx-1" }], cursor: null };
      mockUnlinkClient.getTransactions.mockResolvedValue(mockTxs);

      const { service } = buildService({
        getUnlinkMnemonic: jest.fn().mockResolvedValue("mock mnemonic words"),
      });

      const result = await service.getTransactions(SENDER_ID, "transfer", 10);

      expect(result).toEqual(mockTxs);
      expect(mockUnlinkClient.getTransactions).toHaveBeenCalledWith({
        type: "transfer",
        limit: 10,
      });
    });
  });
});
