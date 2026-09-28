import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { UserRole } from "@/core/domain/user";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));


import { Navbar } from "@/components/layout/navbar";

describe("Navbar", () => {
  it("shows the brand, settings, leaderboard, and login actions for guests", () => {
    const markup = renderToStaticMarkup(<Navbar user={null} />);

    expect(markup).toContain("Bangmod Guesser");
    expect(markup).toContain("bg-transparent");
    expect(markup).not.toContain("backdrop-blur-md");
    expect(markup).toContain("font-weight:900");
    expect(markup).toContain("color:var(--color-secondary-light)");
    expect(markup).toContain(":hover{color:var(--color-primary-main)");
    expect(markup).toContain("color:var(--color-primary-main)");
    expect(markup).toContain("width:2.5rem");
    expect(markup).toContain("height:2.5rem");
    expect(markup).toContain("ตั้งค่าเกม");
    expect(markup).toContain("ตารางอันดับ — เร็ว ๆ นี้");
    expect(markup).toContain('href="/login"');
    expect(markup).toContain("เข้าสู่ระบบ");
    expect(markup).not.toContain("ออกจากระบบ");
    expect(markup).not.toContain('href="/profile"');
    expect(markup).toContain("disabled");
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
    expect(markup).toContain("โปรไฟล์ของ KMUTT Student");
    expect(markup).toContain("ตารางอันดับ — เร็ว ๆ นี้");
    expect(markup).toContain("ออกจากระบบ");
    expect(markup).not.toContain('href="/login"');
  });
});
