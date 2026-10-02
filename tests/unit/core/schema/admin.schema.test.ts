import { describe, expect, it } from "vitest";
import { UserRole } from "@/core/domain/user";
import { AdminRoleSchema, AdminUserUpdateSchema } from "@/core/schema/admin.schema";

describe("admin request schemas", () => {
  it("accepts only one existing role", () => {
    expect(AdminRoleSchema.safeParse(UserRole.ADMIN).success).toBe(true);
    expect(AdminRoleSchema.safeParse(UserRole.USER).success).toBe(true);
    expect(AdminRoleSchema.safeParse([UserRole.ADMIN]).success).toBe(false);
    expect(AdminRoleSchema.safeParse("SUPERADMIN").success).toBe(false);
  });

  it("allows a valid username and no other update field", () => {
    expect(AdminUserUpdateSchema.safeParse({ name: "Student" }).success).toBe(true);
    expect(AdminUserUpdateSchema.safeParse({ name: " " }).success).toBe(false);
    expect(AdminUserUpdateSchema.safeParse({ name: "Student", email: "new@example.com" }).success).toBe(false);
  });
});
