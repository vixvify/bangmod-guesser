import { z } from "zod";
import { AdminUserStatus } from "@/core/domain/admin-user";
import { UserRole } from "@/core/domain/user";
import { UpdateUsernameSchema } from "@/core/schema/profile.schema";
import { MANAGE_USER_MESSAGES } from "@/core/constants/manage-user";

export const ManageUserFormSchema = z
  .object({
    name: UpdateUsernameSchema,
    role: z.enum(UserRole),
    status: z.enum([
      "ACTIVE",
      "TEMPORARY",
      "SUSPENDED",
      "DEACTIVATED",
    ] satisfies AdminUserStatus[]),
    suspension: z.object({
      startDate: z.iso.date().nullable(),
      endDate: z.iso.date().nullable(),
    }),
    reason: z.string().trim().max(200, MANAGE_USER_MESSAGES.reasonMax),
  })
  .superRefine((value, context) => {
    if (value.status !== "TEMPORARY") return;

    if (!value.suspension.startDate || !value.suspension.endDate) {
      context.addIssue({
        code: "custom",
        path: ["suspension"],
        message: MANAGE_USER_MESSAGES.suspensionRequired,
      });
    } else if (value.suspension.endDate < value.suspension.startDate) {
      context.addIssue({
        code: "custom",
        path: ["suspension"],
        message: MANAGE_USER_MESSAGES.suspensionOrder,
      });
    }
  });

export type ManageUserFormInput = z.input<typeof ManageUserFormSchema>;
