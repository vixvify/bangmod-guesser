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
});
