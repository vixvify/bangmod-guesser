import { z } from "zod";
import { UserRole } from "@/core/domain/user";
import { UpdateUsernameSchema } from "@/core/schema/profile.schema";

export const AdminRoleSchema = z.enum(UserRole);
export const AdminUserUpdateSchema = z.strictObject({ name: UpdateUsernameSchema });
