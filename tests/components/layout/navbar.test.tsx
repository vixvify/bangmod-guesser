import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/core/domain/user";

const { pathnameMock } = vi.hoisted(() => ({ pathnameMock: vi.fn(() => "/") }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  usePathname: pathnameMock,
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

import { Navbar } from "@/components/layout/navbar";

describe("Navbar", () => {
  beforeEach(() => pathnameMock.mockReturnValue("/"));

  it("does not mark the brand as active on the home page", () => {
    const markup = renderToStaticMarkup(<Navbar user={null} />);
    const homeLink = markup.match(/<a[^>]*href="\/"[^>]*>/)?.[0];

    expect(homeLink).not.toContain('aria-current="page"');
    expect(markup).not.toContain('aria-current="page"');
  });

  it("marks only the profile link active on the profile page", () => {
    pathnameMock.mockReturnValue("/profile");
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
    const profileLink = markup.match(/<a[^>]*href="\/profile"[^>]*>/)?.[0];

    expect(profileLink).toContain('aria-current="page"');
    expect(profileLink).toContain("navButton");
    expect(markup.match(/aria-current="page"/g)).toHaveLength(1);
  });

  it("links to the leaderboard and marks it active on its page", () => {
    pathnameMock.mockReturnValue("/leaderboard");
    const markup = renderToStaticMarkup(<Navbar user={null} />);
    const leaderboardLink = markup.match(/<a[^>]*href="\/leaderboard"[^>]*>/)?.[0];

    expect(leaderboardLink).toContain('aria-current="page"');
    expect(leaderboardLink).toContain("navButton");
    expect(markup.match(/aria-current="page"/g)).toHaveLength(1);
  });

  it("does not mark unrelated pages as home or profile", () => {
    pathnameMock.mockReturnValue("/admin/users");
    const markup = renderToStaticMarkup(
      <Navbar
        user={{
          id: "admin_1",
          name: "Admin",
          email: "admin@example.com",
          role: UserRole.ADMIN,
        }}
      />,
    );

    expect(markup).not.toContain('aria-current="page"');
  });

  it("shows the brand, settings, leaderboard, and login actions for guests", () => {
    const markup = renderToStaticMarkup(<Navbar user={null} />);

    expect(markup).toContain("Bangmod Guesser");
    expect(markup).toContain("bg-transparent");
    expect(markup).not.toContain("backdrop-blur-md");
    expect(markup).toContain("font-weight:900");
    expect(markup).toContain("color:var(--color-secondary-light)");
    expect(markup).toContain("hover:text-primary-main");
    expect(markup).toContain("width:2.5rem");
    expect(markup).toContain("height:2.5rem");
    expect(markup).toContain("ตั้งค่าเกม");
    expect(markup).toContain('href="/leaderboard"');
    expect(markup).toContain('href="/login"');
    expect(markup.match(/<(?:button|a)[^>]*class="[^"]*navButton[^"]*"[^>]*>/g)).toHaveLength(2);
    expect(markup).toContain("เข้าสู่ระบบ");
    expect(markup).not.toContain("ออกจากระบบ");
    expect(markup).not.toContain('href="/profile"');
  });

  it("shows settings, leaderboard, profile, and logout actions for authenticated users", () => {
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
    expect(markup.match(/<(?:button|a)[^>]*class="[^"]*navButton[^"]*"[^>]*>/g)).toHaveLength(3);
    expect(markup).toContain("โปรไฟล์ของ KMUTT Student");
    expect(markup).toContain('href="/leaderboard"');
    expect(markup).toContain("ออกจากระบบ");
    expect(markup).not.toContain('href="/login"');
  });

  it("keeps one transparent navbar and lets pages set only the brand color", () => {
    const markup = renderToStaticMarkup(
      <Navbar user={null} brandColor="var(--color-secondary-dark)" />,
    );

    expect(markup).toContain("bg-transparent");
    expect(markup).not.toContain("border-neutral-200");
    expect(markup).toContain("color:var(--color-secondary-dark)");
  });
});
