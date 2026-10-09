import { describe, expect, it } from "vitest";
import { UserRole } from "@/core/domain/user";
import {
  AdminBanUserBodySchema,
  AdminRoleSchema,
  AdminSetRoleBodySchema,
  AdminUpdateUserBodySchema,
  AdminUserIdBodySchema,
  AdminUserUpdateSchema,
} from "@/core/schema/admin.schema";

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

describe("admin command bodies", () => {
  it("requires a user ID and a valid username update", () => {
    expect(AdminUserIdBodySchema.safeParse({ userId: "user-1" }).success).toBe(true);
    expect(AdminUserIdBodySchema.safeParse({ userId: "" }).success).toBe(false);
    expect(AdminUpdateUserBodySchema.safeParse({ userId: "user-1", data: { name: "New name" } }).success).toBe(true);
    expect(AdminUpdateUserBodySchema.safeParse({ userId: "user-1", data: { email: "new@example.test" } }).success).toBe(false);
  });

  it("accepts only supported roles and positive ban durations", () => {
    expect(AdminSetRoleBodySchema.safeParse({ userId: "user-1", role: UserRole.ADMIN }).success).toBe(true);
    expect(AdminSetRoleBodySchema.safeParse({ userId: "user-1", role: "SUPERADMIN" }).success).toBe(false);
    expect(AdminBanUserBodySchema.safeParse({ userId: "user-1", banReason: "Violation", banExpiresIn: 3600 }).success).toBe(true);
    expect(AdminBanUserBodySchema.safeParse({ userId: "user-1", banExpiresIn: 0 }).success).toBe(false);
  });
});
