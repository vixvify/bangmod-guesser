import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/app/proxy";
import { AppRoutes } from "@/routes/app/routes";

function createRequest(url: string, cookies: Record<string, string> = {}) {
  const request = new NextRequest(new URL(url, "http://localhost:3000"));
  for (const [key, value] of Object.entries(cookies)) {
    request.cookies.set(key, value);
  }
  return request;
}

describe("App proxy middleware", () => {
  it("redirects authenticated users away from auth routes to home", () => {
    const request = createRequest(AppRoutes.login, {
      "better-auth.session_token": "valid-token",
    });

    const response = proxy(request);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
    expect(response.status).toBe(307);
  });

  it("recognizes __Secure-better-auth.session_token in HTTPS/production", () => {
    const request = createRequest(AppRoutes.register, {
      "__Secure-better-auth.session_token": "valid-token",
    });

    const response = proxy(request);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirects unauthenticated users from protected routes to login with callbackUrl", () => {
    const request = createRequest("/profile?tab=settings");

    const response = proxy(request);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?callbackUrl=%2Fprofile%3Ftab%3Dsettings",
    );
  });

  it("allows unauthenticated access to public routes", () => {
    const request = createRequest(AppRoutes.home);

    const response = proxy(request);
    expect(response.headers.get("location")).toBeNull();
  });

  it("allows guest access to auth routes", () => {
    const request = createRequest(AppRoutes.login);

    const response = proxy(request);
    expect(response.headers.get("location")).toBeNull();
  });
});
