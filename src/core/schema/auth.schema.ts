import { z } from "zod";

import { AUTH_MESSAGES } from "../constants/auth";

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, AUTH_MESSAGES.name.required)
      .min(2, AUTH_MESSAGES.name.min)
      .max(50, AUTH_MESSAGES.name.max),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, AUTH_MESSAGES.email.required)
      .email(AUTH_MESSAGES.email.invalid),

    password: z
      .string()
      .min(1, AUTH_MESSAGES.password.required)
      .min(8, AUTH_MESSAGES.password.min)
      .max(72, AUTH_MESSAGES.password.max)
      .regex(/[A-Z]/, AUTH_MESSAGES.password.uppercase)
      .regex(/[a-z]/, AUTH_MESSAGES.password.lowercase)
      .regex(/[0-9]/, AUTH_MESSAGES.password.number),

    confirmPassword: z.string().min(1, AUTH_MESSAGES.confirmPassword.required),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: AUTH_MESSAGES.confirmPassword.mismatch,
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, AUTH_MESSAGES.email.required)
    .email(AUTH_MESSAGES.email.invalid),

  password: z.string().min(1, AUTH_MESSAGES.password.required),
});

export const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
