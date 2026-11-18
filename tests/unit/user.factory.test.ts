import { describe, expect, it } from "vitest";
import { UserRole } from "@/features/users/user";
import { UserFactory } from "@/features/users/server/user.factory";
import { createUserModel } from "../fixtures/users";

describe("UserFactory.toAccount", () => {
  it("maps a Prisma user and its game count", () => {
    const result = UserFactory.toAccount({
      ...createUserModel(),
      _count: { games: 5 },
    });

    expect(result).toMatchObject({
      id: "user_1",
      role: UserRole.USER,
      status: "ACTIVE",
      gameCount: 5,
      suspension: { startDate: null, endDate: null },
    });
  });

  it("maps the actual suspension start and expiry to Bangkok calendar dates", () => {
    const result = UserFactory.toAccount({
      ...createUserModel({
        banned: true,
        banReason: "Violation",
        banStartedAt: new Date("2099-12-29T18:00:00.000Z"),
        banExpires: new Date("2099-12-31T00:00:00.000Z"),
      }),
      _count: { games: 2 },
    });

    expect(result).toMatchObject({
      status: "SUSPENDED",
      reason: "Violation",
      suspension: { startDate: "2099-12-30", endDate: "2099-12-31" },
    });
  });

  it("does not expose an old ban expiry for an active account", () => {
    const result = UserFactory.toAccount({
      ...createUserModel({
        banExpires: new Date("2099-12-31T00:00:00.000Z"),
      }),
      _count: { games: 0 },
    });
    expect(result.suspension.endDate).toBeNull();
  });

  it("shows the Bangkok date when the stored expiry is on the previous UTC day", () => {
    const result = UserFactory.toAccount({
      ...createUserModel({ banned: true, banExpires: new Date("2099-12-30T17:00:00Z") }),
      _count: { games: 0 },
    });
    expect(result.suspension).toEqual({ startDate: null, endDate: "2099-12-31" });
  });
});
