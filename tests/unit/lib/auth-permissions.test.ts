import { describe, expect, it } from "vitest";
import { UserRole } from "@/core/domain/user";
import { authRoles } from "@/lib/auth-permissions";

describe("admin permissions", () => {
  it("allows the user operations needed by the admin UI", () => {
    expect(authRoles[UserRole.ADMIN].statements).toEqual({
      user: ["get", "list", "update", "ban", "set-role", "delete"],
      session: [],
    });
    expect(authRoles[UserRole.ADMIN].authorize({user: ["get"]}).success).toBe(true);
  });

  it("does not grant admin operations to regular users", () => {
    expect(authRoles[UserRole.USER].statements).toEqual({user: [], session: []});
  });
});