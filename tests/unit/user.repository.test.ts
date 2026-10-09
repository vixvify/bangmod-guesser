import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/core/domain/user";
import { UserRepositoryImpl } from "@/infrastructure/repositories/user.repository";

const { findMany, count, findUnique, update } = vi.hoisted(() => ({
  findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn(), update: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { findMany, count, findUnique, update } } }));

describe("UserRepositoryImpl", () => {
  const repository = new UserRepositoryImpl();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies role, status, and pagination to both the list and count queries", async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(12);

    const result = await repository.findMany({
      page: 2, limit: 9, role: UserRole.ADMIN, status: "SUSPENDED",
    });

    expect(findMany).toHaveBeenCalledWith({
      where: { role: UserRole.ADMIN, status: "SUSPENDED" },
      skip: 9,
      take: 9,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { games: true } } },
    });
    expect(count).toHaveBeenCalledWith({ where: { role: UserRole.ADMIN, status: "SUSPENDED" } });
    expect(result).toEqual({ items: [], total: 12 });
  });

  it("reads one account with its game count", async () => {
    findUnique.mockResolvedValue(null);
    await repository.findById("user-1");
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" }, include: { _count: { select: { games: true } } },
    });
  });

  it("writes the account status through Prisma", async () => {
    await repository.updateStatus("user-1", "INACTIVE");
    expect(update).toHaveBeenCalledWith({ where: { id: "user-1" }, data: { status: "INACTIVE" } });
  });
});
