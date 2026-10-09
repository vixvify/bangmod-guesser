import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/core/domain/user";
import { AppError } from "@/core/errors/app.error";
import type { UserAdminPort } from "@/core/ports/user-admin.port";
import type { UserRepository } from "@/core/ports/user.repository";
import { UserService } from "@/core/service/user.service";
import type { UserFormInput } from "@/core/schema/user.schema";
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
  updateStatus: vi.fn(),
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
    expect(repository.updateStatus).not.toHaveBeenCalled();
    expect(result.name).toBe("Changed");
  });

  it("bans and persists a suspended status", async () => {
    await service.updateUser(new Headers(), record.id, {
      ...form, status: "SUSPENDED", reason: "Violation",
    });

    expect(admin.banUser).toHaveBeenCalledWith(expect.any(Headers), {
      userId: record.id, banReason: "Violation", banExpiresIn: undefined,
    });
    expect(repository.updateStatus).toHaveBeenCalledWith(record.id, "SUSPENDED");
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
    repository.findById.mockResolvedValueOnce({ ...record, status: "SUSPENDED", banned: true });
    await service.updateUser(new Headers(), record.id, form);

    expect(admin.unbanUser).toHaveBeenCalled();
    expect(repository.updateStatus).toHaveBeenCalledWith(record.id, "ACTIVE");
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
});
