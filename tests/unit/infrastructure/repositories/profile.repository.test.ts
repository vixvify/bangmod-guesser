import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileRepositoryImpl } from "@/features/profile/server/profile.repository";

const mocks = vi.hoisted(() => ({ userFindUnique: vi.fn(), gameCount: vi.fn() }));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.userFindUnique },
    game: { count: mocks.gameCount },
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("ProfileRepositoryImpl", () => {
  it("paginates history with a stable tie breaker and the same date filter for records and count", async () => {
    mocks.userFindUnique.mockResolvedValue(null);
    mocks.gameCount.mockResolvedValue(0);

    await new ProfileRepositoryImpl().findProfile("user-1", {
      from: new Date("2026-09-30T17:00:00.000Z"),
      toExclusive: new Date("2026-10-31T17:00:00.000Z"),
      page: 2,
      pageSize: 4,
    });

    expect(mocks.userFindUnique).toHaveBeenCalledWith(expect.objectContaining({
      select: expect.objectContaining({ games: expect.objectContaining({
        orderBy: [{ startedAt: "desc" }, { id: "desc" }],
        skip: 4,
        take: 4,
        where: expect.objectContaining({
          OR: [{ status: "COMPLETED", totalScore: { not: null } }, { status: "INCOMPLETE" }],
          startedAt: {
            gte: new Date("2026-09-30T17:00:00.000Z"),
            lt: new Date("2026-10-31T17:00:00.000Z"),
          },
        }),
      }) }),
    }));
    expect(mocks.gameCount).toHaveBeenCalledWith({ where: expect.objectContaining({
      userId: "user-1", OR: [{ status: "COMPLETED", totalScore: { not: null } }, { status: "INCOMPLETE" }],
      startedAt: {
        gte: new Date("2026-09-30T17:00:00.000Z"),
        lt: new Date("2026-10-31T17:00:00.000Z"),
      },
    }) });
  });
});
