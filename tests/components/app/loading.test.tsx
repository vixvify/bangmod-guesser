import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Loading from "@/app/loading";

describe("Loading", () => {
  it("renders an accessible spinner without additional loading content", () => {
    const markup = renderToStaticMarkup(<Loading />);

    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("กำลังโหลด...");
    expect(markup).toContain("animate-spin");
    expect(markup).toContain("motion-reduce:animate-none");
    expect(markup).not.toContain("Finding your spot");
    expect(markup).not.toContain("animate-loading-scan");
  });
});
