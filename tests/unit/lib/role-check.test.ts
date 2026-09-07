import { describe, expect, it } from "vitest";
import { UserRole, type User } from "@/core/domain/user";
import { roleCheck } from "@/lib/role-check";

const user: User = {
  id: "user_1",
  name: "KMUTT User",
  email: "user@example.com",
  role: UserRole.USER,
};

describe("roleCheck", () => {
  it("returns an authenticated user with an allowed role", () => {
    const admin = { ...user, role: UserRole.ADMIN };

    expect(roleCheck(admin, [UserRole.ADMIN])).toBe(admin);
  });

  it("throws forbidden when the user role is not allowed", () => {
    expect(() => roleCheck(user, [UserRole.ADMIN])).toThrowError(
      expect.objectContaining({ status: 403 }),
    );
  });
});
