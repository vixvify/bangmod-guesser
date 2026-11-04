import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "@/app/profile/page";
import { UserRole } from "@/features/users/user";
import { profileService } from "@/container";
import { requireAuth } from "@/features/auth/server/auth-check";

vi.mock("@/features/auth/server/auth-check", () => ({ requireAuth: vi.fn() }));
vi.mock("@/container", () => ({
  profileService: { getProfile: vi.fn() },
}));
vi.mock("@/shared/lib/http", () => ({ default: { get: vi.fn() } }));
vi.mock("@/features/profile/profile.routes", () => ({ ProfileRoutes: { history: "/api/profile" } }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  usePathname: () => "/profile",
}));
vi.mock("@/features/auth/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

describe("ProfilePage", () => {
  const searchParams = Promise.resolve({});

  beforeEach(() => {
    vi.mocked(profileService.getProfile).mockResolvedValue({
      id: "user_1",
      name: "KMUTT Student",
      email: "student@example.com",
      games: [{ id: "persisted-game", status: "COMPLETED", totalScore: 4200, grade: "S", playedAt: "2026-10-20T10:00:00.000Z" }],
      pagination: { page: 1, pageSize: 4, totalGames: 1, totalPages: 1 },
    });
  });

  it("renders the authenticated user and persisted history in the game theme", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: "user_1",
      name: "KMUTT Student",
      email: "student@example.com",
      image: "https://example.com/student.jpg",
      role: UserRole.USER,
    });

    const markup = renderToStaticMarkup(await ProfilePage({ searchParams }));

    expect(requireAuth).toHaveBeenCalledOnce();
    expect(markup).toContain("KMUTT Student");
    expect(markup).toContain("student@example.com");
    expect(markup).toContain("https://example.com/student.jpg");
    expect(markup).not.toContain("example@gmail.com");
    expect(markup).toContain("ประวัติการเล่นเกม");
    expect(markup).toContain("เลือกช่วงเวลา");
    expect(profileService.getProfile).toHaveBeenCalledWith("user_1", { page: 1 });
    expect(markup).not.toContain("ตั้งแต่วันที่");
    expect(markup).toContain("#persisted-game");
    expect(markup).not.toContain("#GAME-0001");
    expect(markup).toContain("bg-secondary-main text-surface-text");
    expect(markup).not.toContain("data-game-backdrop");
    expect(markup).toContain('data-layout-content="contained"');
    expect(markup).toContain("border-surface-border bg-surface-overlay");
    expect(markup).toContain("color:var(--color-surface-text)");
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

    const markup = renderToStaticMarkup(await ProfilePage({ searchParams }));

    expect(markup).toContain("จัดการระบบ");
    expect(markup).toContain('href="/admin"');
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

    const markup = renderToStaticMarkup(await ProfilePage({ searchParams }));

    expect(markup).toContain("No Photo");
  });

  it("passes validated date and page query to the profile service", async () => {
    vi.mocked(requireAuth).mockResolvedValue({ id: "user_1", name: "Student", email: "student@example.com", role: UserRole.USER });

    await ProfilePage({ searchParams: Promise.resolve({ from: "2026-10-01", to: "2026-10-31", page: "2" }) });

    expect(profileService.getProfile).toHaveBeenCalledWith("user_1", { from: "2026-10-01", to: "2026-10-31", page: 2 });
  });

  it("rejects invalid history filters before reading the profile", async () => {
    vi.mocked(profileService.getProfile).mockClear();
    vi.mocked(requireAuth).mockResolvedValue({ id: "user_1", name: "Student", email: "student@example.com", role: UserRole.USER });

    await expect(ProfilePage({ searchParams: Promise.resolve({ page: "0" }) })).rejects.toMatchObject({ status: 400 });
    expect(profileService.getProfile).not.toHaveBeenCalled();
  });
});
