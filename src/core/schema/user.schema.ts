import { z } from "zod";
import type { UserStatus } from "@/core/domain/user";
import { UserRole } from "@/core/domain/user";
import { UpdateUsernameSchema } from "@/core/schema/profile.schema";
import { USER_MESSAGES } from "@/core/constants/user";

export const UserFormSchema = z
  .object({
    name: UpdateUsernameSchema,
    role: z.enum(UserRole),
    status: z.enum([
      "ACTIVE",
      "SUSPENDED",
      "INACTIVE",
    ] satisfies UserStatus[]),
    suspension: z.object({
      startDate: z.iso.date().nullable(),
      endDate: z.iso.date().nullable(),
    }),
    reason: z.string().trim().max(200, USER_MESSAGES.reasonMax),
  });

export type UserFormInput = z.input<typeof UserFormSchema>;