import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/routes/api/auth.routes", () => ({
  AuthRoutes: { logout: "/api/auth/logout" },
}));

import { HomeLayout } from "@/layout/home-layout";

describe("HomeLayout", () => {
  it("wraps page content with navigation and contributors", () => {
    const markup = renderToStaticMarkup(
      <HomeLayout user={null}>
        <p>Home content</p>
      </HomeLayout>,
    );

    expect(markup).toContain("Home content");
    expect(markup).toContain("Login");
    expect(markup).toContain("Made at Bangmod");
  });
});
