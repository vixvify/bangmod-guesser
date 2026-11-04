import { z } from "zod";
import { USER_MESSAGES } from "./user.constants";

export const UpdateUsernameSchema = z
  .string()
  .trim()
  .min(1, USER_MESSAGES.usernameRequired)
  .min(2, USER_MESSAGES.usernameMin)
  .max(50, USER_MESSAGES.usernameMax);
