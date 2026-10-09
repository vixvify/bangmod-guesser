import { afterEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/core/domain/user";
import { UserAdapter } from "@/infrastructure/adapters/user.adapter";
import { auth } from "@/lib/auth";

afterEach(() => vi.restoreAllMocks());

describe("UserAdapter", () => {
  const adapter = new UserAdapter();
  const headers = new Headers();

  it("updates only the username through Better Auth", async () => {
    const update = vi.spyOn(auth.api, "adminUpdateUser").mockResolvedValue({} as never);
    await adapter.updateName(headers, { userId: "user-1", data: { name: "New name" } });
    expect(update).toHaveBeenCalledWith({ body: { userId: "user-1", data: { name: "New name" } }, headers });
  });

  it("sets the role through Better Auth", async () => {
    const setRole = vi.spyOn(auth.api, "setRole").mockResolvedValue({} as never);
    await adapter.setRole(headers, { userId: "user-1", role: UserRole.ADMIN });
    expect(setRole).toHaveBeenCalledWith({ body: { userId: "user-1", role: UserRole.ADMIN }, headers });
  });

  it("bans with a reason and expiry through Better Auth", async () => {
    const ban = vi.spyOn(auth.api, "banUser").mockResolvedValue({} as never);
    await adapter.banUser(headers, { userId: "user-1", banReason: "Violation", banExpiresIn: 3600 });
    expect(ban).toHaveBeenCalledWith({
      body: { userId: "user-1", banReason: "Violation", banExpiresIn: 3600 }, headers,
    });
  });

  it("unbans and removes users through Better Auth", async () => {
    const unban = vi.spyOn(auth.api, "unbanUser").mockResolvedValue({} as never);
    const remove = vi.spyOn(auth.api, "removeUser").mockResolvedValue({} as never);
    await adapter.unbanUser(headers, { userId: "user-1" });
    await adapter.removeUser(headers, { userId: "user-1" });
    expect(unban).toHaveBeenCalledWith({ body: { userId: "user-1" }, headers });
    expect(remove).toHaveBeenCalledWith({ body: { userId: "user-1" }, headers });
  });
});
