import { z } from "zod";
import { PROFILE_MESSAGES } from "@/core/constants/profile";

export const UpdateUsernameSchema = z
  .string()
  .trim()
  .min(1, PROFILE_MESSAGES.usernameRequired)
  .min(2, PROFILE_MESSAGES.usernameMin)
  .max(50, PROFILE_MESSAGES.usernameMax);

export const UpdateUsernameFormSchema = z.object({ username: UpdateUsernameSchema });

export type UpdateUsernameFormInput = z.input<typeof UpdateUsernameFormSchema>;
