import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { UserRole } from "@/core/domain/user";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/routes/api/auth.routes", () => ({
  AuthRoutes: { logout: "/api/auth/logout" },
}));

vi.mock("@/lib/http", () => ({
  httpClient: { post: vi.fn() },
}));

import { Navbar } from "@/components/layout/navbar";

describe("Navbar", () => {
  it("shows settings and login actions for guests", () => {
    const markup = renderToStaticMarkup(<Navbar user={null} />);

    expect(markup).not.toContain("KMUTT · BANGMOD");
    expect(markup).toContain("Game settings — coming soon");
    expect(markup).toContain('href="/login"');
    expect(markup).toContain("Login");
    expect(markup).not.toContain("Logout");
    expect(markup).toContain("disabled");
  });

  it("shows profile and logout actions for authenticated users", () => {
    const markup = renderToStaticMarkup(
      <Navbar
        user={{
          id: "user_1",
          name: "KMUTT Student",
          email: "student@example.com",
          role: UserRole.USER,
        }}
      />,
    );

    expect(markup).toContain('href="/profile"');
    expect(markup).not.toContain("KMUTT · BANGMOD");
    expect(markup).toContain("KMUTT Student");
    expect(markup).toContain(">K</span>");
    expect(markup).toContain("Logout");
    expect(markup).not.toContain('href="/login"');
  });
});
