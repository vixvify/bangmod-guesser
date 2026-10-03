import { describe, expect, it } from "vitest";
import { UserRole } from "@/core/domain/user";
import { authRoles } from "@/lib/auth-permissions";

describe("admin permissions", () => {
  it("allows only the user operations needed by the admin UI", () => {
    expect(authRoles[UserRole.ADMIN].statements).toEqual({
      user: ["get", "update", "ban", "set-role"],
      session: [],
    });
    expect(authRoles[UserRole.ADMIN].authorize({ user: ["get"] }).success).toBe(true);
  });

  it("does not grant admin operations to regular users", () => {
    expect(authRoles[UserRole.USER].statements).toEqual({ user: [], session: [] });
  });
});
