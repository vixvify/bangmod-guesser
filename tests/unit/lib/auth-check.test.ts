import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/core/domain/user";

const { cookieGet, cookies, getCurrentUser } = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookies: vi.fn(),
  getCurrentUser: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({ cookies }));

vi.mock("@/infrastructure/container", () => ({
  sessionService: { getCurrentUser },
}));

import { authCheck, requireAuth } from "@/lib/auth-check";

const user = {
  id: "user_1",
  name: "KMUTT Student",
  email: "student@example.com",
  role: UserRole.USER,
};

describe("authCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookies.mockResolvedValue({ get: cookieGet });
  });

  it("returns null when no current user exists", async () => {
    cookieGet.mockReturnValue(undefined);
    getCurrentUser.mockResolvedValue(null);

    await expect(authCheck()).resolves.toBeNull();
    expect(getCurrentUser).toHaveBeenCalledWith(null);
  });

  it("returns the current user when the session is valid", async () => {
    cookieGet.mockReturnValue({ value: "session-token" });
    getCurrentUser.mockResolvedValue(user);

    await expect(authCheck()).resolves.toEqual(user);
    expect(getCurrentUser).toHaveBeenCalledWith("session-token");
  });
});

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookies.mockResolvedValue({ get: cookieGet });
  });

  it("throws unauthorized when no current user exists", async () => {
    getCurrentUser.mockResolvedValue(null);

    await expect(requireAuth()).rejects.toMatchObject({ status: 401 });
  });

  it("returns the current user when the session is valid", async () => {
    getCurrentUser.mockResolvedValue(user);

    await expect(requireAuth()).resolves.toEqual(user);
  });
});
