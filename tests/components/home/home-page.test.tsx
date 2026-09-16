import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "@/app/page";
import { UserRole } from "@/core/domain/user";
import { AppError } from "@/core/errors/app.error";
import { authCheck } from "@/lib/auth-check";
import { HomeBackgroundImages } from "@/lib/data";

vi.mock("@/lib/auth-check", () => ({
  authCheck: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/routes/api/auth.routes", () => ({
  AuthRoutes: { logout: "/api/auth/logout" },
}));

async function renderPage() {
  return renderToStaticMarkup(await Page());
}

describe("Home page", () => {
  beforeEach(() => {
    vi.mocked(authCheck).mockRejectedValue(new AppError("Unauthorized", 401));
  });

  it("renders the Bangmod Guesser game lobby", async () => {
    const markup = await renderPage();

    expect(markup).toContain('aria-label="Bangmod Guesser lobby"');
    expect(markup).toContain("Bangmod");
    expect(markup).toContain("Guesser");
    expect(markup).toContain("Play");
    expect(markup).toContain("Login");
    expect(markup).toContain("วิธีเล่น");
  });

  it("offers Play from the lobby", async () => {
    const markup = await renderPage();

    expect(markup).toContain('aria-label="Play Bangmod Guesser"');
  });

  it("renders the campus backdrop alongside the lobby", async () => {
    const markup = await renderPage();

    expect(markup).toContain("kmutt-bangmod-1.jpg");
    expect(markup).toContain("animate-home-background-zoom");
  });

  it("contains five KMUTT campus scenes for the slideshow", () => {
    expect(HomeBackgroundImages).toHaveLength(5);
    expect(HomeBackgroundImages.at(-1)).toBe("/images/kmutt-bangmod-7.jpg");
  });

  it("shows the authenticated navigation state when a user is present", async () => {
    vi.mocked(authCheck).mockResolvedValue({
      id: "user_1",
      name: "KMUTT Student",
      email: "student@example.com",
      role: UserRole.USER,
    });

    const markup = await renderPage();

    expect(markup).toContain("KMUTT Student");
    expect(markup).toContain("Logout");
    expect(markup).not.toContain('href="/login"');
  });

  it("propagates unexpected authentication errors", async () => {
    vi.mocked(authCheck).mockRejectedValue(new Error("Session provider failed"));

    await expect(Page()).rejects.toThrow("Session provider failed");
  });
});
