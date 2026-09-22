import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/layout/footer";

describe("Footer", () => {
  it("renders the site footer with branding, navigation, and affiliation", () => {
    const markup = renderToStaticMarkup(<Footer />);

    expect(markup).toContain('aria-label="Site footer"');
    expect(markup).toContain("BANGMOD");
    expect(markup).toContain("GUESSER");
    expect(markup).toContain("ไปยังหน้าอื่น ๆ");
    expect(markup).toContain("เกี่ยวกับโครงการ");
    expect(markup).toContain("วิทยาการคอมพิวเตอร์ประยุกต์");
    expect(markup).toContain("มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี");
    expect(markup).toContain("All rights reserved");
    expect(markup).not.toContain("KMUTT Campus Guesser");
    expect(markup).not.toContain("โครงการพัฒนาขึ้นเพื่อการศึกษา");
  });
});
