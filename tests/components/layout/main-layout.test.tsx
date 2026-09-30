import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

import { MainLayout } from "@/layout/main-layout";

describe("MainLayout", () => {
  it("keeps full-bleed sections outside a constrained content wrapper", () => {
    const markup = renderToStaticMarkup(
      <MainLayout user={null} variant="fullBleed">
        <section data-testid="full-bleed">Home content</section>
      </MainLayout>,
    );

    expect(markup).toContain('<section data-testid="full-bleed">Home content</section>');
    expect(markup).not.toContain('data-layout-content="contained"');
  });

  it("provides shared page gutters and navbar clearance for contained pages", () => {
    const markup = renderToStaticMarkup(
      <MainLayout user={null} variant="contained">
        <p>Profile content</p>
      </MainLayout>,
    );

    expect(markup).toContain('data-layout-content="contained"');
    expect(markup).toContain("max-w-7xl");
    expect(markup).toContain("pt-24");
    expect(markup).toContain("Profile content");
  });

  it("arranges page content between the navigation and footer", () => {
    const markup = renderToStaticMarkup(
      <MainLayout user={null}>
        <p>Page content</p>
      </MainLayout>,
    );

    expect(markup).toContain("Page content");
    expect(markup).toContain("เข้าสู่ระบบ");
    expect(markup).toContain('aria-label="Site footer"');
    expect(markup).toContain("BANGMOD");
    expect(markup).toContain("GUESSER");
    expect(markup).toContain("วิทยาการคอมพิวเตอร์ประยุกต์");
    expect(markup).not.toContain("lobby-fx");
    expect(markup).not.toContain("kmutt-bangmod-1.jpg");
  });

  it("passes a page-specific wordmark color to the shared navbar", () => {
    const markup = renderToStaticMarkup(
      <MainLayout user={null} brandColor="var(--color-secondary-dark)">
        <p>Profile content</p>
      </MainLayout>,
    );

    expect(markup).toContain("Profile content");
    expect(markup).toContain("color:var(--color-secondary-dark)");
    expect(markup).toContain("bg-transparent");
  });
});
