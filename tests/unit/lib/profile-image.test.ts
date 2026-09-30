import { describe, expect, it } from "vitest";
import { getProfileImageUrl } from "@/lib/profile-image";

describe("getProfileImageUrl", () => {
  it("routes a Google avatar through the Next image cache", () => {
    const image = "https://lh3.googleusercontent.com/a/example=s96-c";
    const result = getProfileImageUrl(image);

    expect(result).toContain("/_next/image?");
    expect(result).toContain(encodeURIComponent(image));
  });

  it("keeps other avatar URLs unchanged", () => {
    expect(getProfileImageUrl("https://example.com/avatar.jpg")).toBe(
      "https://example.com/avatar.jpg",
    );
    expect(getProfileImageUrl(null)).toBeUndefined();
    expect(getProfileImageUrl(undefined)).toBeUndefined();
  });

  it("does not proxy a lookalike host", () => {
    const image = "https://lh3.googleusercontent.com.evil.test/a/example";
    expect(getProfileImageUrl(image)).toBe(image);
  });
});
