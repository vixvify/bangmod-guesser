import { describe, expect, it } from "vitest";
import { UserRole } from "@/core/domain/user";
import { ManageUserFormSchema } from "@/core/schema/manage-user.schema";

const validInput = {
  name: "Bangmod Player",
  role: UserRole.USER,
  status: "ACTIVE" as const,
  suspension: { startDate: null, endDate: null },
  reason: "",
};

describe("ManageUserFormSchema", () => {
  it("accepts an active user without a suspension range", () => {
    expect(ManageUserFormSchema.safeParse(validInput).success).toBe(true);
  });

  it("requires a complete date range for temporary suspension", () => {
    const result = ManageUserFormSchema.safeParse({ ...validInput, status: "TEMPORARY" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(["suspension"]);
  });

  it("rejects a temporary suspension ending before it begins", () => {
    const result = ManageUserFormSchema.safeParse({
      ...validInput,
      status: "TEMPORARY",
      suspension: { startDate: "2026-10-05", endDate: "2026-10-04" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid temporary suspension", () => {
    expect(ManageUserFormSchema.safeParse({
      ...validInput,
      status: "TEMPORARY",
      suspension: { startDate: "2026-10-05", endDate: "2026-10-08" },
    }).success).toBe(true);
  });

  it("rejects an invalid username", () => {
    expect(ManageUserFormSchema.safeParse({ ...validInput, name: " " }).success).toBe(false);
  });
});
