import { z } from "zod";
import { UserRole } from "@/features/users/user";
import { UpdateUsernameSchema } from "@/features/users/username.schema";
import { USER_MESSAGES } from "@/features/users/user.constants";

export const UserIdSchema = z
  .string()
  .trim()
  .min(1, "User ID is required");

const UserStatusSchema = z.enum(["ACTIVE", "SUSPENDED"]);

export const SearchUserQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(9),

  role: z
    .enum(UserRole)
    .optional(),

  status: UserStatusSchema.optional(),
});

export type SearchUserQuery = z.infer<typeof SearchUserQuerySchema>;

export const UserFormSchema = z
  .object({
    name: UpdateUsernameSchema,
    role: z.enum(UserRole),
    status: UserStatusSchema,
    suspension: z.object({
      startDate: z.iso.date().nullable(),
      endDate: z.iso.date().nullable(),
    }),
    reason: z.string().trim().max(200, USER_MESSAGES.reasonMax),
  });

export type UserFormInput = z.input<typeof UserFormSchema>;
