import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/core/domain/user";

const { getSession, headers } = vi.hoisted(() => ({
  getSession: vi.fn(),
  headers: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({ headers }));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession,
    },
  },
}));

import { authCheck, requireAuth } from "@/lib/auth-check";

const domainUser = {
  id: "user_1",
  name: "KMUTT Student",
  email: "student@example.com",
  image: "https://example.com/student.jpg",
  role: UserRole.USER,
};

const session = {
  user: {
    id: "user_1",
    name: "KMUTT Student",
    email: "student@example.com",
    image: "https://example.com/student.jpg",
    role: "USER",
  },
  session: {
    id: "session_1",
    userId: "user_1",
    token: "session-token",
    expiresAt: new Date(),
  },
};

describe("authCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Headers());
  });

  it("returns null when no session exists", async () => {
    getSession.mockResolvedValue(null);

    await expect(authCheck()).resolves.toBeNull();
    expect(getSession).toHaveBeenCalledOnce();
  });

  it("returns the domain user when the session is valid", async () => {
    getSession.mockResolvedValue(session);

    await expect(authCheck()).resolves.toEqual(domainUser);
    expect(getSession).toHaveBeenCalledOnce();
  });

  it("preserves an absent profile image from the session", async () => {
    getSession.mockResolvedValue({
      ...session,
      user: { ...session.user, image: null },
    });

    await expect(authCheck()).resolves.toEqual({ ...domainUser, image: null });
  });
});

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headers.mockResolvedValue(new Headers());
  });

  it("throws unauthorized when no session exists", async () => {
    getSession.mockResolvedValue(null);

    await expect(requireAuth()).rejects.toMatchObject({ status: 401 });
  });

  it("returns the domain user when the session is valid", async () => {
    getSession.mockResolvedValue(session);

    await expect(requireAuth()).resolves.toEqual(domainUser);
  });
});

