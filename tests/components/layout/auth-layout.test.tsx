import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AuthLayout } from "@/layout/auth-layout";

describe("AuthLayout", () => {
  it("places the campus image beside auth content without the main navbar", () => {
    const markup = renderToStaticMarkup(
      <AuthLayout>
        <p>Auth form</p>
      </AuthLayout>,
    );

    expect(markup).toContain("%2Fimages%2Fkmutt-bangmod-1.jpg");
    expect(markup).toContain("Auth form");
    expect(markup).toContain('href="/"');
    expect(markup).not.toContain('aria-label="เมนูหลัก"');
    expect(markup).toContain("grid min-h-svh bg-secondary-main md:grid-cols-[3fr_2fr]");
    expect(markup).toContain("border-t border-surface-border bg-secondary-main");
    expect(markup).toContain("from-secondary-main/90 via-secondary-main/45 to-secondary-main/30");
    expect(markup).toContain("text-surface-text");
    expect(markup).toContain('sizes="(min-width: 48rem) 60vw, 100vw"');
    expect(markup).toContain("w-full max-w-lg");
    expect(markup).not.toContain("max-w-7xl");
    expect(markup).not.toContain("rounded-2xl");
  });
});
