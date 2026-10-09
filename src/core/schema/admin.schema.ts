import { z } from "zod";
import { UserRole } from "@/core/domain/user";
import { UpdateUsernameSchema } from "@/core/schema/profile.schema";
import { UserIdSchema } from "@/core/schema/user.schema";
import { USER_MESSAGES } from "@/core/constants/user";

export const AdminRoleSchema = z.enum(UserRole);
export const AdminUserUpdateSchema = z.strictObject({ name: UpdateUsernameSchema });

export const AdminUserIdBodySchema = z.object({ userId: UserIdSchema });
export const AdminUpdateUserBodySchema = AdminUserIdBodySchema.extend({
  data: AdminUserUpdateSchema,
});
export const AdminSetRoleBodySchema = AdminUserIdBodySchema.extend({
  role: AdminRoleSchema,
});
export const AdminBanUserBodySchema = AdminUserIdBodySchema.extend({
  banReason: z.string().trim().max(200, USER_MESSAGES.reasonMax).optional(),
  banExpiresIn: z.number().int().positive().optional(),
});

export type AdminUserIdBodyInput = z.infer<typeof AdminUserIdBodySchema>;
export type AdminUpdateUserBodyInput = z.infer<typeof AdminUpdateUserBodySchema>;
export type AdminSetRoleBodyInput = z.infer<typeof AdminSetRoleBodySchema>;
export type AdminBanUserBodyInput = z.infer<typeof AdminBanUserBodySchema>;
