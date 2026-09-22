import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/routes/api/auth.routes", () => ({
  AuthRoutes: { logout: "/api/auth/logout" },
}));

vi.mock("@/lib/http", () => ({
  httpClient: { post: vi.fn() },
}));

import { HomeLayout } from "@/layout/home-layout";

describe("HomeLayout", () => {
  it("arranges page content between the navigation and footer", () => {
    const markup = renderToStaticMarkup(
      <HomeLayout user={null}>
        <p>Home content</p>
      </HomeLayout>,
    );

    expect(markup).toContain("Home content");
    expect(markup).toContain("Login");
    expect(markup).toContain('aria-label="Site footer"');
    expect(markup).toContain("BANGMOD");
    expect(markup).toContain("GUESSER");
    expect(markup).toContain("วิทยาการคอมพิวเตอร์ประยุกต์");
    expect(markup).not.toContain("lobby-fx");
    expect(markup).not.toContain("kmutt-bangmod-1.jpg");
  });
});
