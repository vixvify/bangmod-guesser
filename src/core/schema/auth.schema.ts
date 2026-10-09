import { z } from "zod";

import { AUTH_MESSAGES } from "../constants/auth";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, AUTH_MESSAGES.email.required)
  .email(AUTH_MESSAGES.email.invalid);

const passwordSchema = z
  .string()
  .min(1, AUTH_MESSAGES.password.required)
  .min(8, AUTH_MESSAGES.password.min)
  .max(72, AUTH_MESSAGES.password.max)
  .regex(/[A-Z]/, AUTH_MESSAGES.password.uppercase)
  .regex(/[a-z]/, AUTH_MESSAGES.password.lowercase)
  .regex(/[0-9]/, AUTH_MESSAGES.password.number);

const confirmPasswordSchema = z.string().min(1, AUTH_MESSAGES.confirmPassword.required);

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, AUTH_MESSAGES.name.required)
      .min(2, AUTH_MESSAGES.name.min)
      .max(50, AUTH_MESSAGES.name.max),

    email: emailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: AUTH_MESSAGES.confirmPassword.mismatch,
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: emailSchema,

  password: z.string().min(1, AUTH_MESSAGES.password.required),
});

export const GoogleSignInSchema = z.object({
  callbackURL: z.string(),
  errorCallbackURL: z.string(),
});

export const RequestPasswordResetSchema = z.object({ email: emailSchema });

export const ResetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: AUTH_MESSAGES.confirmPassword.mismatch,
    path: ["confirmPassword"],
  });

export const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type GoogleSignInInput = z.infer<typeof GoogleSignInSchema>;
export type RequestPasswordResetInput = z.infer<typeof RequestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
