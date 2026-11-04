import { describe, expect, it } from "vitest";
import { UserRole, type User } from "@/features/users/user";
import { hasRole, roleCheck } from "@/shared/lib/role-check";

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

describe("hasRole", () => {
  it("recognizes an allowed role without throwing", () => {
    expect(hasRole({ ...user, role: UserRole.ADMIN }, [UserRole.ADMIN])).toBe(true);
    expect(hasRole(user, [UserRole.ADMIN])).toBe(false);
    expect(hasRole(null, [UserRole.ADMIN])).toBe(false);
  });
});
