import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { promoteInitialAdmin } from "../../../prisma/seed-admin";

function createDatabase(user: {
  id: string;
  role: Role;
  banned: boolean;
  status: UserStatus;
} | null, existingAdmin: { id: string } | null = null) {
  const findUnique = vi.fn().mockResolvedValue(user);
  const findFirst = vi.fn().mockResolvedValue(existingAdmin);
  const update = vi.fn().mockResolvedValue({ ...user, role: Role.ADMIN });
  const transaction = { user: { findUnique, findFirst, update } };
  const database = {
    $transaction: vi.fn((operation: (client: typeof transaction) => Promise<unknown>) =>
      operation(transaction)),
  } as unknown as PrismaClient;

  return { database, findUnique, findFirst, update };
}

const eligibleUser = {
  id: "user-1",
  role: Role.USER,
  banned: false,
  status: UserStatus.ACTIVE,
};

describe("promoteInitialAdmin", () => {
  it("promotes an existing account only when no admin exists", async () => {
    const { database, update } = createDatabase(eligibleUser);

    await expect(promoteInitialAdmin(database, "admin@example.com")).resolves.toBe("promoted");
    expect(update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { role: Role.ADMIN },
    });
  });

  it("is safe to rerun for the same account", async () => {
    const { database, findFirst, update } = createDatabase({ ...eligibleUser, role: Role.ADMIN });

    await expect(promoteInitialAdmin(database, "admin@example.com")).resolves.toBe("already-admin");
    expect(findFirst).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects an email without a registered account", async () => {
    const { database, update } = createDatabase(null);

    await expect(promoteInitialAdmin(database, "missing@example.com")).rejects.toThrow("Admin account not found");
    expect(update).not.toHaveBeenCalled();
  });

  it.each([
    { ...eligibleUser, banned: true },
    { ...eligibleUser, status: UserStatus.SUSPENDED },
  ])("rejects a banned or suspended account", async (user) => {
    const { database, update } = createDatabase(user);

    await expect(promoteInitialAdmin(database, "admin@example.com")).rejects.toThrow("cannot become the initial admin");
    expect(update).not.toHaveBeenCalled();
  });

  it("does not promote a second admin", async () => {
    const { database, update } = createDatabase(eligibleUser, { id: "other-admin" });

    await expect(promoteInitialAdmin(database, "admin@example.com")).rejects.toThrow("An admin already exists");
    expect(update).not.toHaveBeenCalled();
  });
});
