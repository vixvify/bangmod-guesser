import { describe, expect, it } from "vitest";
import { getUserStatus } from "@/shared/lib/user-status";

describe("getUserStatus", () => {
  const now = new Date("2026-11-17T10:00:00.000Z");

  it("returns ACTIVE when the user is not banned", () => {
    expect(getUserStatus({ banned: false, banExpires: null }, now)).toBe("ACTIVE");
  });

  it("returns SUSPENDED when the user is banned without an expiry date", () => {
    expect(getUserStatus({ banned: true, banExpires: null }, now)).toBe("SUSPENDED");
  });

  it("returns SUSPENDED when the ban has not expired", () => {
    expect(getUserStatus({
      banned: true,
      banExpires: new Date("2026-11-18T10:00:00.000Z"),
    }, now)).toBe("SUSPENDED");
  });

  it("returns ACTIVE when the ban has expired", () => {
    expect(getUserStatus({
      banned: true,
      banExpires: new Date("2026-11-16T10:00:00.000Z"),
    }, now)).toBe("ACTIVE");
  });

  it("returns ACTIVE when the ban expires exactly at the current time", () => {
    expect(getUserStatus({
      banned: true,
      banExpires: now,
    }, now)).toBe("ACTIVE");
  });
});
