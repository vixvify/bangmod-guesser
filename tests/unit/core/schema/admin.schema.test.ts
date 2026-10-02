import { describe, expect, it } from "vitest";
import { UserRole } from "@/core/domain/user";
import { AdminRoleSchema, AdminUserUpdateSchema } from "@/core/schema/admin.schema";

describe("AdminRoleSchema", () => {
  it("accepts only the application's single USER or ADMIN role", () => {
    expect(AdminRoleSchema.safeParse(UserRole.USER).success).toBe(true);
    expect(AdminRoleSchema.safeParse(UserRole.ADMIN).success).toBe(true);
    expect(AdminRoleSchema.safeParse("admin").success).toBe(false);
    expect(AdminRoleSchema.safeParse([UserRole.ADMIN]).success).toBe(false);
    expect(AdminRoleSchema.safeParse("ADMIN,USER").success).toBe(false);
  });
});

describe("AdminUserUpdateSchema", () => {
  it("accepts a username change", () => {
    expect(AdminUserUpdateSchema.safeParse({ name: "Student" }).success).toBe(true);
  });

  it("rejects other fields and empty updates", () => {
    expect(AdminUserUpdateSchema.safeParse({}).success).toBe(false);
    expect(AdminUserUpdateSchema.safeParse({ role: UserRole.ADMIN }).success).toBe(false);
    expect(AdminUserUpdateSchema.safeParse({ password: "secret" }).success).toBe(false);
    expect(AdminUserUpdateSchema.safeParse({ banned: true }).success).toBe(false);
    expect(AdminUserUpdateSchema.safeParse({ email: "new@example.com" }).success).toBe(false);
    expect(AdminUserUpdateSchema.safeParse({ image: null }).success).toBe(false);
  });
});
