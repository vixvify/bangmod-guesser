import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContentContainer } from "@/components/layout/content-container";

describe("ContentContainer", () => {
  it("uses the same responsive gutters at every supported content width", () => {
    for (const width of ["narrow", "content", "wide", "full"] as const) {
      const markup = renderToStaticMarkup(
        <ContentContainer contentWidth={width}>Content</ContentContainer>,
      );

      expect(markup).toContain("px-4 sm:px-8 lg:px-12");
      expect(markup).toContain("Content");
    }
  });
});
