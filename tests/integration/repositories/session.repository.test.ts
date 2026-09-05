import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { AuthRepositoryImpl } from "@/infrastructure/repositories/auth.repository";
import { SessionRepositoryImpl } from "@/infrastructure/repositories/session.repository";
import { hashPassword } from "@/lib/password";
import {
  disconnectTestDatabase,
  resetTestDatabase,
} from "../../helpers/test-database";

describe.sequential("SessionRepositoryImpl", () => {
  const authRepository = new AuthRepositoryImpl();
  const sessionRepository = new SessionRepositoryImpl();

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it("returns the user with role only for an unexpired token", async () => {
    const user = await authRepository.create({
      name: "KMUTT Student",
      email: "repository@example.com",
      password: await hashPassword("Password123"),
    });
    await sessionRepository.create(
      user.id,
      "active-token",
      new Date(Date.now() + 60_000),
    );
    await sessionRepository.create(
      user.id,
      "expired-token",
      new Date(Date.now() - 60_000),
    );

    await expect(sessionRepository.findUserByToken("active-token")).resolves.toMatchObject({
      id: user.id,
      role: { name: "USER" },
    });
    await expect(sessionRepository.findUserByToken("expired-token")).resolves.toBeNull();
  });

  it("revokes a token", async () => {
    const user = await authRepository.create({
      name: "KMUTT Student",
      email: "revoke@example.com",
      password: await hashPassword("Password123"),
    });
    await sessionRepository.create(
      user.id,
      "revoke-token",
      new Date(Date.now() + 60_000),
    );

    await sessionRepository.deleteByToken("revoke-token");

    await expect(sessionRepository.findUserByToken("revoke-token")).resolves.toBeNull();
  });
});
