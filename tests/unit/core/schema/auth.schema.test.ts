import { describe, expect, it } from "vitest";
import { AUTH_MESSAGES } from "@/core/constants/auth";
import {
  LoginSchema,
  RegisterSchema,
  RequestPasswordResetSchema,
  ResetPasswordSchema,
} from "@/core/schema/auth.schema";
import { validLogin, validRegistration } from "../../../fixtures/users";

describe("RegisterSchema", () => {
  it("trims the name and normalizes the email", () => {
    const result = RegisterSchema.parse({
      ...validRegistration,
      name: "  KMUTT Student  ",
      email: "  STUDENT@EXAMPLE.COM  ",
    });

    expect(result.name).toBe("KMUTT Student");
    expect(result.email).toBe("student@example.com");
  });

  it("rejects mismatched password confirmation", () => {
    const result = RegisterSchema.safeParse({
      ...validRegistration,
      confirmPassword: "AnotherPassword123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        AUTH_MESSAGES.confirmPassword.mismatch,
      );
    }
  });
});

describe("LoginSchema", () => {
  it("normalizes the email", () => {
    const result = LoginSchema.parse({
      ...validLogin,
      email: "  STUDENT@EXAMPLE.COM  ",
    });

    expect(result.email).toBe("student@example.com");
  });
});

describe("RequestPasswordResetSchema", () => {
  it("normalizes a valid email and rejects an invalid email", () => {
    expect(RequestPasswordResetSchema.parse({ email: "  STUDENT@EXAMPLE.COM  " })).toEqual({
      email: "student@example.com",
    });
    expect(RequestPasswordResetSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });
});

describe("ResetPasswordSchema", () => {
  it("accepts a strong password when confirmation matches", () => {
    expect(ResetPasswordSchema.safeParse({
      password: "Password1",
      confirmPassword: "Password1",
    }).success).toBe(true);
  });

  it("rejects weak or mismatched passwords", () => {
    expect(ResetPasswordSchema.safeParse({
      password: "short",
      confirmPassword: "short",
    }).success).toBe(false);

    const result = ResetPasswordSchema.safeParse({
      password: "Password1",
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(AUTH_MESSAGES.confirmPassword.mismatch);
    }
  });
});
