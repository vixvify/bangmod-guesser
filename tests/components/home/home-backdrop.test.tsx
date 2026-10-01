import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeBackdrop } from "@/components/home/home-backdrop";

describe("HomeBackdrop", () => {
  it("renders the campus slideshow and pixel layers outside page layout", () => {
    const markup = renderToStaticMarkup(<HomeBackdrop />);

    expect(markup).toContain("kmutt-bangmod-1.jpg");
    expect(markup).toContain("lobby-fx");
    expect(markup).toContain("data-home-vignette");
    expect(markup).not.toContain("border-primary-soft/50");
  });
});
