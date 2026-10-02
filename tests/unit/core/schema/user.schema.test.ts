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

  it("requires a complete date range for temporary suspension", () => {
    const result = UserFormSchema.safeParse({ ...validInput, status: "TEMPORARY" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(["suspension"]);
  });

  it("rejects a temporary suspension ending before it begins", () => {
    const result = UserFormSchema.safeParse({
      ...validInput,
      status: "TEMPORARY",
      suspension: { startDate: "2026-10-05", endDate: "2026-10-04" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid temporary suspension", () => {
    expect(UserFormSchema.safeParse({
      ...validInput,
      status: "TEMPORARY",
      suspension: { startDate: "2026-10-05", endDate: "2026-10-08" },
    }).success).toBe(true);
  });

  it("rejects an invalid username", () => {
    expect(UserFormSchema.safeParse({ ...validInput, name: " " }).success).toBe(false);
  });
});
