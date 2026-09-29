import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ProfilePage from "@/app/profile/page";
import { UserRole } from "@/core/domain/user";
import { authCheck } from "@/lib/auth-check";

vi.mock("@/lib/auth-check", () => ({ authCheck: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

describe("ProfilePage", () => {
  it("renders the mock profile and history inside the light main layout", async () => {
    vi.mocked(authCheck).mockResolvedValue({
      id: "user_1",
      name: "KMUTT Student",
      email: "student@example.com",
      role: UserRole.USER,
    });

    const markup = renderToStaticMarkup(await ProfilePage());

    expect(authCheck).toHaveBeenCalledOnce();
    expect(markup).toContain("Username");
    expect(markup).toContain("example@gmail.com");
    expect(markup).toContain("ประวัติการเล่นเกม");
    expect(markup).toContain("เลือกช่วงเวลา");
    expect(markup).toContain("2 กันยายน 2026 - 4 กันยายน 2026");
    expect(markup).not.toContain("ตั้งแต่วันที่");
    expect(markup).toContain("#GAME-0001");
    expect(markup).toContain("bg-slate-50 text-secondary-dark");
    expect(markup).toContain("border-slate-200 bg-white");
    expect(markup).toContain("color:var(--color-secondary-dark)");
    expect(markup).toContain("ออกจากระบบ");
    expect(markup).toContain("โปรไฟล์ของ KMUTT Student");
    expect(markup).not.toContain("จัดการระบบ");
  });

  it("shows the system management button only for an admin", async () => {
    vi.mocked(authCheck).mockResolvedValue({
      id: "admin_1",
      name: "KMUTT Admin",
      email: "admin@example.com",
      role: UserRole.ADMIN,
    });

    const markup = renderToStaticMarkup(await ProfilePage());

    expect(markup).toContain("จัดการระบบ");
    expect(markup).toContain("var(--color-primary-main)");
  });
});
