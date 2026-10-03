import { describe, expect, it } from "vitest";
import { extractImageKey } from "@/lib/image-key";

describe("extractImageKey", () => {
  it("returns the storage key from a public image URL", () => {
    expect(
      extractImageKey(
        "https://cdn.example.com/assets/images/3f2504e0-4f89-11d3-9a0c-0305e82c3301.webp",
      ),
    ).toBe("images/3f2504e0-4f89-11d3-9a0c-0305e82c3301.webp");
  });

  it("rejects unrelated or malformed URLs", () => {
    expect(extractImageKey("https://cdn.example.com/images/other.jpg")).toBeNull();
    expect(extractImageKey("not-a-url")).toBeNull();
  });
});
