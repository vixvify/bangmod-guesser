import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/features/users/user";
import { AppError } from "@/shared/errors/app.error";
import { APIError } from "better-auth/api";
import type { UserAdminPort } from "@/features/users/server/user-admin.port";
import type { UserRepository } from "@/features/users/server/user.repository.port";
import { UserService } from "@/features/users/server/user.service";
import type { UserFormInput } from "@/features/users/user.schema";
import { createUserModel } from "../../../fixtures/users";

const record = { ...createUserModel(), _count: { games: 5 } };
const query = { page: 2, limit: 9, role: UserRole.ADMIN, status: "ACTIVE" as const };
const form: UserFormInput = {
  name: record.name,
  role: UserRole.USER,
  status: "ACTIVE",
  suspension: { startDate: null, endDate: null },
  reason: "",
};

const repository = {
  findMany: vi.fn(),
  findById: vi.fn(),
  findBanExpiryByEmail: vi.fn(),
} satisfies UserRepository;
const admin = {
  updateName: vi.fn(),
  setRole: vi.fn(),
  banUser: vi.fn(),
  unbanUser: vi.fn(),
  removeUser: vi.fn(),
} satisfies UserAdminPort;

describe("UserService", () => {
  const service = new UserService(repository, admin);

  beforeEach(() => {
    vi.clearAllMocks();
    repository.findById.mockResolvedValue(record);
  });

  it("uses the schema-derived query and maps Prisma users to accounts", async () => {
    repository.findMany.mockResolvedValue({ items: [record], total: 12 });

    const result = await service.getUsers(query);

    expect(repository.findMany).toHaveBeenCalledWith(query);
    expect(result).toMatchObject({ page: 2, limit: 9, total: 12 });
    expect(result.users[0]).toMatchObject({ id: record.id, gameCount: 5, status: "ACTIVE" });
  });

  it("updates only changed name and role through Better Auth", async () => {
    const updated = { ...record, name: "Changed", role: "ADMIN" as const };
    repository.findById.mockResolvedValueOnce(record).mockResolvedValueOnce(updated);
    const headers = new Headers();

    const result = await service.updateUser(headers, record.id, {
      ...form, name: "Changed", role: UserRole.ADMIN,
    });

    expect(admin.updateName).toHaveBeenCalledWith(headers, { userId: record.id, data: { name: "Changed" } });
    expect(admin.setRole).toHaveBeenCalledWith(headers, { userId: record.id, role: UserRole.ADMIN });
    expect(admin.banUser).not.toHaveBeenCalled();
    expect(result.name).toBe("Changed");
  });

  it("bans a user through Better Auth", async () => {
    await service.updateUser(new Headers(), record.id, {
      ...form,
      status: "SUSPENDED",
      reason: "Violation",
    });

    expect(admin.banUser).toHaveBeenCalledWith(expect.any(Headers), {
      userId: record.id,
      banReason: "Violation",
      banExpiresIn: undefined,
    });
  });

  it("sets the suspension expiry at midnight Thailand time", async () => {
    const now = new Date("2026-11-18T05:00:00.000Z").getTime();
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(now);

    try {
      await service.updateUser(new Headers(), record.id, {
        ...form,
        status: "SUSPENDED",
        suspension: { startDate: null, endDate: "2026-11-19" },
      });
      expect(admin.banUser).toHaveBeenCalledWith(expect.any(Headers), {
        userId: record.id,
        banReason: undefined,
        banExpiresIn: 43200,
      });
    } finally {
      nowSpy.mockRestore();
    }
  });

  it("rounds up the suspension expiry to avoid expiring before Bangkok midnight", async () => {
    const now = new Date("2026-11-18T05:00:00.500Z").getTime();
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(now);

    try {
      await service.updateUser(new Headers(), record.id, {
        ...form,
        status: "SUSPENDED",
        suspension: { startDate: null, endDate: "2026-11-19" },
      });
      expect(admin.banUser).toHaveBeenCalledWith(expect.any(Headers), {
        userId: record.id,
        banReason: undefined,
        banExpiresIn: 43200,
      });
    } finally {
      nowSpy.mockRestore();
    }
  });

  it("does not reapply a suspension when editing the user with the same Bangkok expiry date", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2099-12-29T05:00:00Z"));
    try {
      repository.findById.mockResolvedValue({ ...record, banned: true, banExpires: new Date("2099-12-30T17:00:00Z"), banReason: "Violation" });
      await service.updateUser(new Headers(), record.id, {
        ...form, name: "Changed", status: "SUSPENDED", reason: "Violation",
        suspension: { startDate: null, endDate: "2099-12-31" },
      });
      expect(admin.updateName).toHaveBeenCalledOnce();
      expect(admin.banUser).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("preserves the expiry date when changing the reason for a temporary suspension", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2099-12-29T05:00:00Z"));
    try {
      repository.findById.mockResolvedValue({ ...record, banned: true, banExpires: new Date("2099-12-30T17:00:00Z"), banReason: "Old reason" });
      await service.updateUser(new Headers(), record.id, {
        ...form, status: "SUSPENDED", reason: "New reason",
        suspension: { startDate: null, endDate: "2099-12-31" },
      });
      expect(admin.banUser).toHaveBeenCalledWith(expect.any(Headers), {
        userId: record.id, banReason: "New reason", banExpiresIn: 129600,
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("rejects an expired suspension before changing the account", async () => {
    await expect(service.updateUser(new Headers(), record.id, {
      ...form,
      name: "Changed",
      status: "SUSPENDED",
      suspension: { startDate: null, endDate: "2020-01-01" },
    })).rejects.toBeInstanceOf(AppError);

    expect(admin.updateName).not.toHaveBeenCalled();
    expect(admin.banUser).not.toHaveBeenCalled();
  });

  it("unbans a suspended account when reactivated", async () => {
    repository.findById.mockResolvedValueOnce({
      ...record,
      banned: true,
      banExpires: null,
    });

    await service.updateUser(new Headers(), record.id, form);

    expect(admin.unbanUser).toHaveBeenCalledWith(expect.any(Headers), {
      userId: record.id,
    });
  });

  it("unbans an account with an expired suspension when reactivated", async () => {
    repository.findById.mockResolvedValueOnce({
      ...record,
      banned: true,
      banExpires: new Date("2020-01-01"),
    });

    await service.updateUser(new Headers(), record.id, form);

    expect(admin.unbanUser).toHaveBeenCalledWith(expect.any(Headers), {
      userId: record.id,
    });
  });

  it("returns 404 for a missing user and does not call the adapter", async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.updateUser(new Headers(), "missing", form)).rejects.toMatchObject({ status: 404 });
    expect(admin.updateName).not.toHaveBeenCalled();
  });

  it("deletes an existing user through Better Auth", async () => {
    const headers = new Headers();
    await service.deleteUser(headers, record.id);
    expect(admin.removeUser).toHaveBeenCalledWith(headers, { userId: record.id });
  });

  it("maps an admin provider error to an application error", async () => {
    admin.removeUser.mockRejectedValueOnce(new APIError("FORBIDDEN"));
    await expect(service.deleteUser(new Headers(), record.id))
      .rejects.toMatchObject({ name: "AppError", status: 403, message: "User deletion failed" });
  });
});
