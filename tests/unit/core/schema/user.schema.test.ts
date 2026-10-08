import { describe, expect, it } from "vitest";
import { UserRole } from "@/core/domain/user";
import { UserFormSchema } from "@/core/schema/user.schema";

const validInput = {
  name: "Bangmod Player",
  role: UserRole.USER,
  status: "ACTIVE" as const,
  suspension: { startDate: null, endDate: null },
  reason: "",
};

describe("UserFormSchema", () => {
  it("accepts an active user without a suspension range", () => {
    expect(UserFormSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts a suspended user without an end date", () => {
    const result = UserFormSchema.safeParse({
      ...validInput,
      status: "SUSPENDED",
      suspension: {
        startDate: null,
        endDate: null,
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts a suspended user with an end date", () => {
    const result = UserFormSchema.safeParse({
      ...validInput,
      status: "SUSPENDED",
      suspension: {
        startDate: "2026-10-05",
        endDate: "2026-10-08",
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts an inactive user", () => {
    const result = UserFormSchema.safeParse({
      ...validInput,
      status: "INACTIVE",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid status", () => {
    const result = UserFormSchema.safeParse({
      ...validInput,
      status: "TEMPORARY",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid username", () => {
    expect(
      UserFormSchema.safeParse({
        ...validInput,
        name: " ",
      }).success,
    ).toBe(false);
  });
});