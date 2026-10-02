import { z } from "zod";
import { UserRole } from "@/core/domain/user";
import { UpdateUsernameSchema } from "@/core/schema/profile.schema";

export const AdminRoleSchema = z.enum(UserRole);

export const AdminUserUpdateSchema = z
  .object({
    name: UpdateUsernameSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0);
