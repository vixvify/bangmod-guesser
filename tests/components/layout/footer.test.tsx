import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/layout/footer";
import { Contributors } from "@/lib/data";

describe("Footer", () => {
  it("shows contributor names with their profile links", () => {
    const markup = renderToStaticMarkup(<Footer />);

    expect(markup).toContain("Made at Bangmod");
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noreferrer"');

    for (const contributor of Contributors) {
      expect(markup).toContain(contributor.name);
      expect(markup).toContain(`href="${contributor.href.replaceAll("&", "&amp;")}"`);
    }
  });
});
