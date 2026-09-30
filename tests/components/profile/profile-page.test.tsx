import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ProfilePage from "@/app/profile/page";
import { UserRole } from "@/core/domain/user";
import { requireAuth } from "@/lib/auth-check";

vi.mock("@/lib/auth-check", () => ({ requireAuth: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

describe("ProfilePage", () => {
  it("renders the authenticated user profile and mock history inside the light main layout", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: "user_1",
      name: "KMUTT Student",
      email: "student@example.com",
      image: "https://example.com/student.jpg",
      role: UserRole.USER,
    });

    const markup = renderToStaticMarkup(await ProfilePage());

    expect(requireAuth).toHaveBeenCalledOnce();
    expect(markup).toContain("KMUTT Student");
    expect(markup).toContain("student@example.com");
    expect(markup).toContain("https://example.com/student.jpg");
    expect(markup).not.toContain("example@gmail.com");
    expect(markup).toContain("ประวัติการเล่นเกม");
    expect(markup).toContain("เลือกช่วงเวลา");
    expect(markup).toContain("2 กันยายน 2026 - 4 กันยายน 2026");
    expect(markup).not.toContain("ตั้งแต่วันที่");
    expect(markup).toContain("#GAME-0001");
    expect(markup).toContain("bg-slate-50 text-secondary-dark");
    expect(markup).toContain('data-layout-content="contained"');
    expect(markup).toContain("border-slate-200 bg-white");
    expect(markup).toContain("color:var(--color-secondary-dark)");
    expect(markup).toContain("ออกจากระบบ");
    expect(markup).toContain("โปรไฟล์ของ KMUTT Student");
    expect(markup).not.toContain("จัดการระบบ");
  });

  it("shows the system management button only for an admin", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: "admin_1",
      name: "KMUTT Admin",
      email: "admin@example.com",
      role: UserRole.ADMIN,
    });

    const markup = renderToStaticMarkup(await ProfilePage());

    expect(markup).toContain("จัดการระบบ");
    expect(markup).toContain("var(--color-primary-main)");
  });

  it("renders the authenticated user when Better Auth has no image", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: "user_2",
      name: "No Photo",
      email: "student@example.com",
      image: null,
      role: UserRole.USER,
    });

    const markup = renderToStaticMarkup(await ProfilePage());

    expect(markup).toContain("No Photo");
  });
});
