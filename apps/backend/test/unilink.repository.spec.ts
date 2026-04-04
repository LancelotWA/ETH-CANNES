import { UnilinkRepository } from "../src/modules/unilink/unilink.repository";

// ─── Mock Prisma ──────────────────────────────────────────────────────────────

function buildRepository(userOverrides: Record<string, jest.Mock> = {}) {
  const prisma = {
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
      ...userOverrides,
    },
  } as any;

  const repository = new UnilinkRepository(prisma);
  return { repository, prisma };
}

const USER_ID = "de305d54-75b4-431b-adb2-eb6b9e546014";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("UnilinkRepository", () => {
  describe("setUnlinkAccount", () => {
    it("updates the user with mnemonic and address", async () => {
      const { repository, prisma } = buildRepository({
        update: jest.fn().mockResolvedValue({ id: USER_ID }),
      });

      await repository.setUnlinkAccount(USER_ID, "test mnemonic", "unlink1abc");

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: USER_ID },
        data: { unlinkMnemonic: "test mnemonic", unlinkAddress: "unlink1abc" },
      });
    });
  });

  describe("getUnlinkMnemonic", () => {
    it("returns mnemonic when user exists", async () => {
      const { repository } = buildRepository({
        findUnique: jest.fn().mockResolvedValue({ unlinkMnemonic: "secret words" }),
      });

      const result = await repository.getUnlinkMnemonic(USER_ID);
      expect(result).toBe("secret words");
    });

    it("returns null when user not found", async () => {
      const { repository } = buildRepository({
        findUnique: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.getUnlinkMnemonic(USER_ID);
      expect(result).toBeNull();
    });

    it("returns null when user has no mnemonic", async () => {
      const { repository } = buildRepository({
        findUnique: jest.fn().mockResolvedValue({ unlinkMnemonic: null }),
      });

      const result = await repository.getUnlinkMnemonic(USER_ID);
      expect(result).toBeNull();
    });
  });

  describe("getUnlinkAddress", () => {
    it("returns address when user exists", async () => {
      const { repository } = buildRepository({
        findUnique: jest.fn().mockResolvedValue({ unlinkAddress: "unlink1xyz" }),
      });

      const result = await repository.getUnlinkAddress(USER_ID);
      expect(result).toBe("unlink1xyz");
    });

    it("returns null when user not found", async () => {
      const { repository } = buildRepository({
        findUnique: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.getUnlinkAddress(USER_ID);
      expect(result).toBeNull();
    });
  });

  describe("findUserByUnlinkAddress", () => {
    it("returns user when address matches", async () => {
      const mockUser = { id: USER_ID, unlinkAddress: "unlink1abc" };
      const { repository } = buildRepository({
        findUnique: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await repository.findUserByUnlinkAddress("unlink1abc");

      expect(result).toEqual(mockUser);
    });

    it("returns null when no user has that address", async () => {
      const { repository } = buildRepository({
        findUnique: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findUserByUnlinkAddress("unlink1unknown");
      expect(result).toBeNull();
    });
  });
});
