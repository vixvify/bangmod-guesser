import { describe, expect, it } from "vitest";
import { UserRole } from "@/core/domain/user";
import { authRoles } from "@/lib/auth-permissions";

describe("Better Auth admin permissions", () => {
  it("lets ADMIN list, rename, ban, delete, and manage roles for users", () => {
    expect(
      authRoles.ADMIN.authorize({
        user: ["get", "list", "set-role", "update", "ban", "delete"],
      }).success,
    ).toBe(true);
  });

  it("does not let USER change roles or access admin operations", () => {
    expect(authRoles.USER.authorize({ user: ["set-role"] }).success).toBe(false);
    expect(authRoles.USER.authorize({ user: ["list"] }).success).toBe(false);
    expect(authRoles.USER.authorize({ user: ["update", "delete"] }).success).toBe(false);
  });

  it("does not grant email changes or impersonation to ADMIN", () => {
    expect(authRoles.ADMIN.authorize({ user: ["set-email"] }).success).toBe(false);
    expect(authRoles.ADMIN.authorize({ user: ["impersonate"] }).success).toBe(false);
  });

  it("uses the existing domain role names", () => {
    expect(Object.keys(authRoles)).toEqual([UserRole.USER, UserRole.ADMIN]);
  });
});
