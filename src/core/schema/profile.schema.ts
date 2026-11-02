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

const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value);
};

const ProfileDateSchema = z
  .string()
  .refine(
    isValidDate,
    "Date must be a valid date in YYYY-MM-DD format",
  );

export const ProfileQuerySchema = z
  .object({
    from: ProfileDateSchema.optional(),
    to: ProfileDateSchema.optional(),
    page: z.coerce
      .number()
      .int("Page must be an integer")
      .min(1, "Page must be a positive integer")
      .default(1),
  })
  .superRefine((data, ctx) => {
    if (data.from && data.to && data.from > data.to) {
      ctx.addIssue({
        code: "custom",
        path: ["from"],
        message: "From date must not be after to date",
      });
    }
  });

export type ProfileQueryInput = z.infer<typeof ProfileQuerySchema>;
