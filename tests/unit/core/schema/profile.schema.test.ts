import { describe, expect, it } from "vitest";
import {
  UpdateUsernameFormSchema,
  UpdateUsernameSchema,
} from "@/core/schema/profile.schema";

describe("UpdateUsernameSchema", () => {
  it("trims a valid username before saving", () => {
    expect(UpdateUsernameSchema.parse("  Bangmod Player  ")).toBe("Bangmod Player");
  });

  it("rejects blank and one-character usernames", () => {
    expect(UpdateUsernameSchema.safeParse("   ").success).toBe(false);
    expect(UpdateUsernameSchema.safeParse("A").success).toBe(false);
  });

  it("rejects usernames longer than 50 characters", () => {
    expect(UpdateUsernameSchema.safeParse("a".repeat(51)).success).toBe(false);
  });
});

describe("UpdateUsernameFormSchema", () => {
  it("validates and trims the username field", () => {
    expect(UpdateUsernameFormSchema.parse({ username: "  Bangmod Player  " })).toEqual({
      username: "Bangmod Player",
    });
    expect(UpdateUsernameFormSchema.safeParse({ username: "  " }).success).toBe(false);
  });
});
