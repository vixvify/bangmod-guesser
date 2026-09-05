import { describe, expect, it } from "vitest";
import { AUTH_MESSAGES } from "@/core/constants/auth";
import { LoginSchema, RegisterSchema } from "@/core/schema/auth.schema";
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
