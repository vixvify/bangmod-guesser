import { describe, expect, it, vi } from "vitest";

const runtime = vi.hoisted(() => ({ authUrl: "https://example.com", isPreview: false }));
vi.mock("@/shared/config/runtime", () => ({ config: runtime }));
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "geist" }),
  Geist_Mono: () => ({ variable: "geist-mono" }),
  Prompt: () => ({ variable: "prompt" }),
}));

import { metadata } from "@/app/layout";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("site metadata", () => {
  it("uses the configured origin and describes the game for search and social sharing", () => {
    expect(metadata.metadataBase?.toString()).toBe("https://example.com/");
    expect(metadata.title).toBe("Bangmod Guesser");
    expect(metadata.description).toContain("บางมด");
    expect(metadata.openGraph).toMatchObject({ type: "website", title: "Bangmod Guesser" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("prevents preview deployments from being indexed", async () => {
    runtime.isPreview = true;
    vi.resetModules();
    try {
      const preview = await import("@/app/layout");
      expect(preview.metadata.robots).toMatchObject({ index: false, follow: false });
      expect(sitemap()).toEqual([]);
      expect(robots().sitemap).toBeUndefined();
    } finally {
      runtime.isPreview = false;
      vi.resetModules();
    }
  });

  it("lists the public home page in the sitemap", () => {
    expect(sitemap()).toEqual([{ url: "https://example.com" }]);
    expect(robots().sitemap).toBe("https://example.com/sitemap.xml");
  });
});
