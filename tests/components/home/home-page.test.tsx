import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "@/app/page";
import { UserRole } from "@/core/domain/user";
import { authCheck } from "@/lib/auth-check";

vi.mock("@/lib/auth-check", () => ({
  authCheck: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));


async function renderPage() {
  return renderToStaticMarkup(await Page());
}

describe("Home page", () => {
  beforeEach(() => {
    vi.mocked(authCheck).mockResolvedValue(null);
  });

  it("renders the Bangmod Guesser game lobby", async () => {
    const markup = await renderPage();

    expect(markup).toContain('aria-label="Bangmod Guesser lobby"');
    expect(markup).not.toContain('data-layout-content="contained"');
    expect(markup).toContain("Bangmod");
    expect(markup).toContain("Guesser");
    expect(markup).toContain("Play");
    expect(markup).toContain("เข้าสู่ระบบ");
    expect(markup).toContain("เกมทายสถานที่ในรั้วบางมด");
    expect(markup).toContain("ดูภาพ แล้วทายว่าอยู่ที่ไหน");
    expect(markup).toContain("คณะผู้จัดทำ");
    expect(markup).not.toContain(">Credits</button>");
  });

  it("offers Play from the lobby", async () => {
    const markup = await renderPage();

    expect(markup).toContain('aria-label="Play Bangmod Guesser"');
  });

  it("shows the authenticated navigation state when a user is present", async () => {
    vi.mocked(authCheck).mockResolvedValue({
      id: "user_1",
      name: "KMUTT Student",
      email: "student@example.com",
      role: UserRole.USER,
    });

    const markup = await renderPage();

    expect(markup).toContain("โปรไฟล์ของ KMUTT Student");
    expect(markup).toContain("ออกจากระบบ");
    expect(markup).not.toContain('href="/login"');
  });

  it("propagates unexpected authentication errors", async () => {
    vi.mocked(authCheck).mockRejectedValue(new Error("Session provider failed"));

    await expect(Page()).rejects.toThrow("Session provider failed");
  });
});
