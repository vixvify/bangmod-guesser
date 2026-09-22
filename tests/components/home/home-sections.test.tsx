import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeSections } from "@/components/home/home-sections";

describe("HomeSections", () => {
  it("presents the introduction, how-to-play steps, and credits as separate screens", () => {
    const markup = renderToStaticMarkup(<HomeSections />);

    expect(markup).toContain('id="introduction"');
    expect(markup).toContain("เกมทายสถานที่ในรั้วบางมด");
    expect(markup).toContain('id="how-to-play"');
    expect(markup).toContain("รับภาพปริศนา");
    expect(markup).toContain("สังเกตให้ดี");
    expect(markup).toContain("เลือกคำตอบ");
    expect(markup).toContain('id="credits"');
    expect(markup).toContain("คณะผู้จัดทำ");
  });
});
