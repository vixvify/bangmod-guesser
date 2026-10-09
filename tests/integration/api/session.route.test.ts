import { beforeEach, describe, expect, it, vi } from "vitest";

const { signIn, signUp, googleSignIn, signOut } = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  googleSignIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/infrastructure/container", () => ({
  authService: { signIn, signUp, googleSignIn, signOut },
}));

import { POST as login } from "@/app/api/session/login/route";
import { POST as register } from "@/app/api/session/register/route";
import { POST as google } from "@/app/api/session/google/route";
import { POST as logout } from "@/app/api/session/logout/route";

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
});
