import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { AppRoutes } from "@/routes/app/routes";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock("@/lib/auth", () => ({ auth: { api: { getSession } } }));

function createRequest(url: string, cookies: Record<string, string> = {}) {
  const request = new NextRequest(new URL(url, "http://localhost:3000"));
  for (const [key, value] of Object.entries(cookies)) {
    request.cookies.set(key, value);
  }
  return request;
}

describe("App proxy middleware", () => {
  beforeEach(() => {
    getSession.mockReset();
    getSession.mockResolvedValue(null);
  });

  it("redirects authenticated users away from auth routes to home", async () => {
    getSession.mockResolvedValue({ user: { id: "user_1" } });
    const request = createRequest(AppRoutes.login, {
      "better-auth.session_token": "valid-token",
    });

    const response = await proxy(request);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
    expect(response.status).toBe(307);
    expect(getSession).toHaveBeenCalledWith({ headers: request.headers });
  });

  it("recognizes __Secure-better-auth.session_token in HTTPS/production", async () => {
    getSession.mockResolvedValue({ user: { id: "user_1" } });
    const request = createRequest(AppRoutes.register, {
      "__Secure-better-auth.session_token": "valid-token",
    });

    const response = await proxy(request);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirects unauthenticated users from protected routes to login with callbackUrl", async () => {
    const request = createRequest("/profile?tab=settings");

    const response = await proxy(request);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?callbackUrl=%2Fprofile%3Ftab%3Dsettings",
    );
    expect(getSession).not.toHaveBeenCalled();
  });

  it("rejects a protected request with an expired session cookie", async () => {
    const request = createRequest("/profile?tab=settings", {
      "better-auth.session_token": "expired-token",
    });

    const response = await proxy(request);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?callbackUrl=%2Fprofile%3Ftab%3Dsettings",
    );
    expect(getSession).toHaveBeenCalledWith({ headers: request.headers });
  });

  it("allows a protected request when its session is valid", async () => {
    getSession.mockResolvedValue({ user: { id: "user_1" } });
    const response = await proxy(createRequest(AppRoutes.profile, {
      "better-auth.session_token": "valid-token",
    }));

    expect(response.headers.get("location")).toBeNull();
  });

  it("allows an auth route when its cookie has expired", async () => {
    const response = await proxy(createRequest(AppRoutes.login, {
      "better-auth.session_token": "expired-token",
    }));

    expect(response.headers.get("location")).toBeNull();
  });

  it("allows unauthenticated access to public routes", async () => {
    const request = createRequest(AppRoutes.home);

    const response = await proxy(request);
    expect(response.headers.get("location")).toBeNull();
    expect(getSession).not.toHaveBeenCalled();
  });

  it("allows guest access to auth routes", async () => {
    const request = createRequest(AppRoutes.login);

    const response = await proxy(request);
    expect(response.headers.get("location")).toBeNull();
  });

  it.each([AppRoutes.forgotPassword, AppRoutes.resetPassword])(
    "allows guests to open %s",
    async (pathname) => {
      const response = await proxy(createRequest(pathname));

      expect(response.headers.get("location")).toBeNull();
      expect(getSession).not.toHaveBeenCalled();
    },
  );
});
