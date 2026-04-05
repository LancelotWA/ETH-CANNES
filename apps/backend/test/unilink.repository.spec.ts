import { UnilinkRepository } from "../src/modules/unilink/unilink.repository";

const USER_ID = "de305d54-75b4-431b-adb2-eb6b9e546014";

describe("UnilinkRepository", () => {
  let repository: UnilinkRepository;

  beforeEach(() => {
    repository = new UnilinkRepository();
  });

  it("stores and retrieves an account", () => {
    repository.setUnlinkAccount(USER_ID, "test mnemonic", "unlink1abc", "0x1234567890abcdef1234567890abcdef12345678");

    expect(repository.getUnlinkMnemonic(USER_ID)).toBe("test mnemonic");
    expect(repository.getUnlinkAddress(USER_ID)).toBe("unlink1abc");
  });

  it("returns null for unknown user", () => {
    expect(repository.getUnlinkMnemonic(USER_ID)).toBeNull();
    expect(repository.getUnlinkAddress(USER_ID)).toBeNull();
  });

  it("finds user by unlink address", () => {
    repository.setUnlinkAccount(USER_ID, "mnemonic", "unlink1abc", "0x1234567890abcdef1234567890abcdef12345678");

    const result = repository.findUserByUnlinkAddress("unlink1abc");
    expect(result).toEqual({ id: USER_ID, unlinkAddress: "unlink1abc" });
  });

  it("returns null for unknown address", () => {
    expect(repository.findUserByUnlinkAddress("unlink1unknown")).toBeNull();
  });
});
