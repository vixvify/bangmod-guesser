import { describe, expect, it } from "vitest";
import {
  ProfileQuerySchema,
  UpdateUsernameFormSchema,
} from "@/features/profile/profile.schema";
import { UpdateUsernameSchema } from "@/features/users/username.schema";

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

describe("ProfileQuerySchema", () => {
  it("uses page 1 when page is not provided", () => {
    expect(ProfileQuerySchema.parse({})).toEqual({
      page: 1,
    });
  });

  it("validates and coerces query parameters", () => {
    expect(
      ProfileQuerySchema.parse({
        from: "2026-10-01",
        to: "2026-10-31",
        page: "2",
      }),
    ).toEqual({
      from: "2026-10-01",
      to: "2026-10-31",
      page: 2,
    });
  });

  it("rejects invalid page numbers", () => {
    expect(ProfileQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(ProfileQuerySchema.safeParse({ page: "-1" }).success).toBe(false);
    expect(ProfileQuerySchema.safeParse({ page: "1.5" }).success).toBe(false);
    expect(ProfileQuerySchema.safeParse({ page: "abc" }).success).toBe(false);
  });

  it("rejects invalid date formats", () => {
    expect(
      ProfileQuerySchema.safeParse({ from: "01-10-2026" }).success,
    ).toBe(false);
  });

  it("rejects invalid calendar dates", () => {
    expect(
      ProfileQuerySchema.safeParse({ from: "2026-02-30" }).success,
    ).toBe(false);
  });

  it("rejects date ranges where from is after to", () => {
    const result = ProfileQuerySchema.safeParse({
      from: "2026-10-31",
      to: "2026-10-01",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "From date must not be after to date",
      );
    }
  });
});
