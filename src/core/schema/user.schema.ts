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
      "TEMPORARY",
      "SUSPENDED",
      "DEACTIVATED",
    ] satisfies UserStatus[]),
    suspension: z.object({
      startDate: z.iso.date().nullable(),
      endDate: z.iso.date().nullable(),
    }),
    reason: z.string().trim().max(200, USER_MESSAGES.reasonMax),
  })
  .superRefine((value, context) => {
    if (value.status !== "TEMPORARY") return;

    if (!value.suspension.startDate || !value.suspension.endDate) {
      context.addIssue({
        code: "custom",
        path: ["suspension"],
        message: USER_MESSAGES.suspensionRequired,
      });
    } else if (value.suspension.endDate < value.suspension.startDate) {
      context.addIssue({
        code: "custom",
        path: ["suspension"],
        message: USER_MESSAGES.suspensionOrder,
      });
    }
  });

export type UserFormInput = z.input<typeof UserFormSchema>;
