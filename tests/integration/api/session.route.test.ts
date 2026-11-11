import { beforeEach, describe, expect, it, vi } from "vitest";

const { signIn, signUp, googleSignIn, signOut, requestPasswordReset, resetPassword, enforce } = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  googleSignIn: vi.fn(),
  signOut: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  enforce: vi.fn(),
}));

vi.mock("@/shared/lib/security/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/lib/security/rate-limit")>();
  return { ...actual, clientIp: () => "203.0.113.1", enforceRateLimit: enforce };
});
vi.mock("@/container", () => ({
  authService: { signIn, signUp, googleSignIn, signOut, requestPasswordReset, resetPassword },
}));

import { POST as login } from "@/app/api/session/login/route";
import { POST as register } from "@/app/api/session/register/route";
import { POST as google } from "@/app/api/session/google/route";
import { POST as logout } from "@/app/api/session/logout/route";
import { POST as forgotPassword } from "@/app/api/session/forgot-password/route";
import { POST as resetPasswordRoute } from "@/app/api/session/reset-password/route";
import { RateLimitError } from "@/shared/lib/security/rate-limit";

function post(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("session API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enforce.mockReset();
  });

  it.each([
    ["forgot-password", forgotPassword, { email: "student@example.com" }],
    ["reset-password", resetPasswordRoute, { token: "valid-reset-token", password: "NewPassword1", confirmPassword: "NewPassword1" }],
  ])("applies origin protection and auth rate limits to %s", async (path, route, body) => {
    const forbidden = await route(new Request(`http://localhost/api/session/${path}`, {
      method: "POST", headers: { "content-type": "application/json", origin: "https://untrusted.example" },
      body: JSON.stringify(body),
    }));
    expect(forbidden.status).toBe(403);
    expect(enforce).not.toHaveBeenCalled();

    enforce.mockRejectedValueOnce(new RateLimitError(25));
    const limited = await route(post(`/api/session/${path}`, body));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBe("25");
    expect(enforce).toHaveBeenCalledWith("auth", "ip", "203.0.113.1");
    expect(requestPasswordReset).not.toHaveBeenCalled();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("validates credentials and forwards the Better Auth session cookie", async () => {
    signIn.mockResolvedValue(new Headers({ "set-cookie": "session=abc; HttpOnly; Path=/" }));
    const response = await login(post("/api/session/login", {
      email: " STUDENT@EXAMPLE.COM ", password: "Password1",
    }));

    expect(response.status).toBe(200);
    expect(signIn).toHaveBeenCalledWith(expect.any(Headers), {
      email: "student@example.com", password: "Password1",
    });
    expect(response.headers.get("set-cookie")).toContain("session=abc");
    expect((await response.json()).data).toBeNull();
  });

  it("rejects invalid login input before calling the service", async () => {
    const response = await login(post("/api/session/login", { email: "invalid", password: "" }));
    expect(response.status).toBe(400);
    expect(signIn).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON without calling the service", async () => {
    const response = await login(new Request("http://localhost/api/session/login", {
      method: "POST", headers: { "content-type": "application/json" }, body: "{",
    }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Invalid JSON payload" });
    expect(signIn).not.toHaveBeenCalled();
  });

  it("returns a safe 500 when an internal operation throws a syntax error", async () => {
    signIn.mockRejectedValueOnce(new SyntaxError("private implementation details"));
    const response = await login(post("/api/session/login", {
      email: "student@example.com", password: "Password1",
    }));
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ error: "Internal server error" });
  });

  it("registers with the fields sent by the signup page, without a confirmation field", async () => {
    signUp.mockResolvedValue(undefined);
    const response = await register(post("/api/session/register", {
      name: " Player ", email: " PLAYER@EXAMPLE.COM ",
      password: "Password1",
    }));

    expect(response.status).toBe(201);
    expect(signUp).toHaveBeenCalledWith(expect.any(Headers), {
      name: "Player", email: "player@example.com", password: "Password1",
    });
    expect((await response.json()).data).toBeNull();
  });

  it("rejects a weak signup password before calling the service", async () => {
    const response = await register(post("/api/session/register", {
      name: "Player", email: "player@example.com", password: "weak",
    }));

    expect(response.status).toBe(400);
    expect(signUp).not.toHaveBeenCalled();
  });

  it("forwards the OAuth state cookie with the Google redirect URL", async () => {
    googleSignIn.mockResolvedValue({
      url: "https://accounts.google.com/oauth", headers: new Headers({ "set-cookie": "oauth_state=abc; HttpOnly" }),
    });
    const response = await google(post("/api/session/google", {
      callbackURL: "/game", errorCallbackURL: "/login",
    }));

    expect(response.headers.get("set-cookie")).toContain("oauth_state=abc");
    expect((await response.json()).data.url).toBe("https://accounts.google.com/oauth");
  });

  it("passes request cookies to sign out and forwards the clearing cookie", async () => {
    signOut.mockResolvedValue(new Headers({ "set-cookie": "session=; Max-Age=0; Path=/" }));
    const request = new Request("http://localhost/api/session/logout", {
      method: "POST", headers: { cookie: "session=abc" },
    });
    const response = await logout(request);

    expect(signOut).toHaveBeenCalledWith(request.headers);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("requests a password reset with a normalized email", async () => {
    requestPasswordReset.mockResolvedValue(undefined);
    const response = await forgotPassword(post("/api/session/forgot-password", {
      email: " STUDENT@EXAMPLE.COM ",
    }));

    expect(response.status).toBe(200);
    expect(requestPasswordReset).toHaveBeenCalledWith(
      expect.any(Headers),
      { email: "student@example.com" },
    );
    expect((await response.json()).data).toBeNull();
  });

  it("rejects an invalid email before requesting a password reset", async () => {
    const response = await forgotPassword(post("/api/session/forgot-password", {
      email: "invalid-email",
    }));

    expect(response.status).toBe(400);
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });

  it("resets a password with the supplied token and password fields", async () => {
    resetPassword.mockResolvedValue(undefined);
    const response = await resetPasswordRoute(post("/api/session/reset-password", {
      token: "valid-reset-token",
      password: "NewPassword1",
      confirmPassword: "NewPassword1",
    }));

    expect(response.status).toBe(200);
    expect(resetPassword).toHaveBeenCalledWith(
      expect.any(Headers),
      "valid-reset-token",
      {
        password: "NewPassword1",
        confirmPassword: "NewPassword1",
      },
    );
    expect((await response.json()).data).toBeNull();
  });

  it("rejects a reset request when the passwords do not match", async () => {
    const response = await resetPasswordRoute(post("/api/session/reset-password", {
      token: "valid-reset-token",
      password: "NewPassword1",
      confirmPassword: "DifferentPassword1",
    }));

    expect(response.status).toBe(400);
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("rejects a reset request without a token", async () => {
    const response = await resetPasswordRoute(post("/api/session/reset-password", {
      password: "NewPassword1",
      confirmPassword: "NewPassword1",
    }));

    expect(response.status).toBe(400);
    expect(resetPassword).not.toHaveBeenCalled();
  });
});
