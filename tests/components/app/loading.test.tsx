import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Loading from "@/app/loading";

describe("Loading", () => {
  it("renders the Bangmod map loading state with accessible status", () => {
    const markup = renderToStaticMarkup(<Loading />);

    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("Finding your spot");
    expect(markup).toContain("กำลังเตรียมแผนที่บางมด...");
    expect(markup).toContain("animate-loading-orbit");
    expect(markup).toContain("animate-loading-scan");
    expect(markup).toContain("motion-reduce:animate-none");
  });
});
