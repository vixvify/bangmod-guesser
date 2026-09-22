import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookieGet, cookies } = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock("@/infrastructure/container", () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
  },
  sessionService: {
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({ cookies }));

vi.mock("@/lib/auth-check", () => ({
  authCheck: vi.fn(),
  requireAuth: vi.fn(),
}));

import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { GET as currentUser } from "@/app/api/auth/me/route";
import { POST as register } from "@/app/api/auth/register/route";
import { authService, sessionService } from "@/infrastructure/container";
import { AppError } from "@/core/errors/app.error";
import { UserRole } from "@/core/domain/user";
import { requireAuth } from "@/lib/auth-check";
import { validLogin, validRegistration } from "../../fixtures/users";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/auth", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const user = {
  id: "user_1",
  name: validRegistration.name,
  email: validRegistration.email,
  role: UserRole.USER,
};

describe("Auth API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookies.mockResolvedValue({ get: cookieGet });
  });

  it("returns a public user after registration", async () => {
    vi.mocked(authService.register).mockResolvedValue(user);

    const response = await register(jsonRequest(validRegistration));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual({
      data: user,
      status: 201,
      statusCode: "CREATED",
    });
    expect(authService.register).toHaveBeenCalledWith(validRegistration);
  });

  it("returns a conflict for a duplicate registration", async () => {
    vi.mocked(authService.register).mockRejectedValue(
      new AppError("Email is already registered", 409),
    );

    const response = await register(jsonRequest(validRegistration));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: "Email is already registered",
      status: 409,
      statusCode: "ERROR",
    });
  });

  it("creates an HTTP-only session cookie after login", async () => {
    vi.mocked(authService.login).mockResolvedValue(user);
    const { sessionService } = await import("@/infrastructure/container");
    vi.mocked(sessionService.create).mockResolvedValue("session-token");

    const response = await login(jsonRequest(validLogin));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      data: {
        email: validRegistration.email,
        role: "USER",
      },
      status: 200,
      statusCode: "SUCCESS",
    });
    expect(payload.data).not.toHaveProperty("password");
    expect(response.headers.get("set-cookie")).toContain("accessToken=");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(sessionService.create).toHaveBeenCalledWith(user.id);
  });

  it("returns the authenticated user from the current-user endpoint", async () => {
    vi.mocked(requireAuth).mockResolvedValue(user);

    const response = await currentUser();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: user,
      status: 200,
      statusCode: "SUCCESS",
    });
  });

  it("clears the session cookie and deletes the current token on logout", async () => {
    cookieGet.mockReturnValue({ value: "session-token" });
    vi.mocked(sessionService.delete).mockResolvedValue(undefined);

    const response = await logout();

    expect(response.status).toBe(200);
    expect(sessionService.delete).toHaveBeenCalledWith("session-token");
    expect(response.headers.get("set-cookie")).toContain("accessToken=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
