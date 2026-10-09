import { describe, expect, it } from "vitest";
import { UserRole } from "@/core/domain/user";
import { UserFactory } from "@/infrastructure/factories/user.factory";
import { createUserModel } from "../fixtures/users";

describe("UserFactory.toAccount", () => {
  it("maps a Prisma user and its game count", () => {
    const result = UserFactory.toAccount({ ...createUserModel(), _count: { games: 5 } });

    expect(result).toMatchObject({
      id: "user_1",
      role: UserRole.USER,
      status: "ACTIVE",
      gameCount: 5,
      suspension: { startDate: null, endDate: null },
    });
  });

  it("formats a suspended user's expiry as the date used by the edit form", () => {
    const result = UserFactory.toAccount({
      ...createUserModel({
        status: "SUSPENDED",
        banned: true,
        banReason: "Violation",
        banExpires: new Date("2099-12-31T00:00:00.000Z"),
      }),
      _count: { games: 2 },
    });

    expect(result.reason).toBe("Violation");
    expect(result.suspension.endDate).toBe("2099-12-31");
  });

  it("does not expose an old ban expiry for an active account", () => {
    const result = UserFactory.toAccount({
      ...createUserModel({ banExpires: new Date("2099-12-31T00:00:00.000Z") }),
      _count: { games: 0 },
    });
    expect(result.suspension.endDate).toBeNull();
  });
});
