import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/features/users/user";
import { UserRepositoryImpl } from "@/features/users/server/user.repository";

const { findMany, count, findUnique } = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    user: { findMany, count, findUnique },
  },
}));

describe("UserRepositoryImpl", () => {
  const repository = new UserRepositoryImpl();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters suspended users before pagination and count", async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(12);

    const beforeQuery = Date.now();
    const result = await repository.findMany({
      page: 2,
      limit: 9,
      role: UserRole.ADMIN,
      status: "SUSPENDED",
    });

    const afterQuery = Date.now();
    const where = findMany.mock.calls[0][0].where;
    expect(where).toMatchObject({
      role: UserRole.ADMIN,
      banned: true,
      OR: [{ banExpires: null }, { banExpires: { gt: expect.any(Date) } }],
    });

    const expiryDate = where.OR[1].banExpires.gt;
    expect(expiryDate.getTime()).toBeGreaterThanOrEqual(beforeQuery);
    expect(expiryDate.getTime()).toBeLessThanOrEqual(afterQuery);

    expect(findMany).toHaveBeenCalledWith({
      where,
      skip: 9,
      take: 9,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { games: true } } },
    });

    expect(count).toHaveBeenCalledWith({ where });
    expect(result).toEqual({ items: [], total: 12 });
  });

  it("filters active users by ban status and expired ban date", async () => {
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(5);

    await repository.findMany({
      page: 1,
      limit: 9,
      status: "ACTIVE",
    });

    const where = findMany.mock.calls[0][0].where;

    expect(where).toMatchObject({
      OR: [
        { banned: false },
        { banned: true, banExpires: { lte: expect.any(Date) } },
      ],
    });

    expect(count).toHaveBeenCalledWith({ where });
  });

  it("reads one account with its game count", async () => {
    findUnique.mockResolvedValue(null);
    await repository.findById("user-1");
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      include: { _count: { select: { games: true } } },
    });
  });
});
