import { describe, expect, it } from "vitest";
import { getAuthRedirect } from "@/lib/auth-redirect";

describe("getAuthRedirect", () => {
  it("keeps local paths and falls back to home for external destinations", () => {
    expect(getAuthRedirect("/game?mode=solo")).toBe("/game?mode=solo");
    expect(getAuthRedirect("https://example.com")).toBe("/");
    expect(getAuthRedirect("//example.com")).toBe("/");
    expect(getAuthRedirect("/\\example.com")).toBe("/");
    expect(getAuthRedirect(undefined)).toBe("/");
  });
});
