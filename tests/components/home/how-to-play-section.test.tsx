import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HowToPlaySection } from "@/components/home/how-to-play-section";

describe("HowToPlaySection", () => {
  it("renders the how-to-play section with all three gameplay steps", () => {
    const markup = renderToStaticMarkup(<HowToPlaySection />);

    expect(markup).toContain('id="how-to-play"');
    expect(markup).toContain("02 — HOW TO PLAY");
    expect(markup).toContain("วิธีเล่น");
    expect(markup).toContain("LOOK");
    expect(markup).toContain("รับภาพปริศนา");
    expect(markup).toContain("THINK");
    expect(markup).toContain("สังเกตให้ดี");
    expect(markup).toContain("PIN");
    expect(markup).toContain("เลือกคำตอบ");
  });
});
