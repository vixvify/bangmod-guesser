import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IntroSection } from "@/components/home/intro-section";

describe("IntroSection", () => {
  it("renders the introduction section with game description and mystery photo", () => {
    const markup = renderToStaticMarkup(<IntroSection />);

    expect(markup).toContain('id="introduction"');
    expect(markup).toContain("01 — THE CAMPUS IS YOUR PLAYGROUND");
    expect(markup).toContain("Know your");
    expect(markup).toContain("campus");
    expect(markup).toContain("เกมทายสถานที่ในรั้วบางมด");
    expect(markup).toContain("Bangmod Guesser ชวนคุณกลับไปมองบางมดอีกครั้ง");
    expect(markup).toContain("LOCATION UNKNOWN");
    expect(markup).toContain("จำมุมนี้ได้ไหม?");
  });
});
