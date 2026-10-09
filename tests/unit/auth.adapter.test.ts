import { beforeEach, describe, expect, it, vi } from "vitest";

const { signInEmail, signUpEmail, signInSocial, signOut } = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  signUpEmail: vi.fn(),
  signInSocial: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { signInEmail, signUpEmail, signInSocial, signOut } },
}));

import { AuthAdapter } from "@/infrastructure/adapters/auth.adapter";

describe("AuthAdapter", () => {
  const adapter = new AuthAdapter();
  const headers = new Headers({ origin: "http://localhost:3000", cookie: "session=old" });

  beforeEach(() => vi.clearAllMocks());

  it("uses the server-side Better Auth API for email login and returns its cookies", async () => {
    const responseHeaders = new Headers({ "set-cookie": "session=new; HttpOnly" });
    signInEmail.mockResolvedValue({ headers: responseHeaders });

    expect(await adapter.signIn(headers, { email: "a@example.com", password: "Password1" }))
      .toBe(responseHeaders);
    expect(signInEmail).toHaveBeenCalledWith({
      body: { email: "a@example.com", password: "Password1" },
      headers,
      returnHeaders: true,
    });
  });

  it("registers without invoking the browser auth client", async () => {
    signUpEmail.mockResolvedValue({ user: { id: "u1" } });
    await adapter.signUp(headers, {
      name: "Player", email: "a@example.com", password: "Password1",
    });
    expect(signUpEmail).toHaveBeenCalledWith({
      body: { name: "Player", email: "a@example.com", password: "Password1" },
      headers,
    });
  });

  it("returns the OAuth URL and state cookie together", async () => {
    const responseHeaders = new Headers({ "set-cookie": "oauth_state=abc; HttpOnly" });
    signInSocial.mockResolvedValue({
      response: { url: "https://accounts.google.com/" }, headers: responseHeaders,
    });
    expect(await adapter.googleSignIn(headers, "/game", "/login")).toEqual({
      url: "https://accounts.google.com/", headers: responseHeaders,
    });
    expect(signInSocial).toHaveBeenCalledWith({
      body: { provider: "google", callbackURL: "/game", errorCallbackURL: "/login" },
      headers,
      returnHeaders: true,
    });
  });

  it("forwards session headers to Better Auth when signing out", async () => {
    const responseHeaders = new Headers({ "set-cookie": "session=; Max-Age=0" });
    signOut.mockResolvedValue({ headers: responseHeaders });
    expect(await adapter.signOut(headers)).toBe(responseHeaders);
    expect(signOut).toHaveBeenCalledWith({ headers, returnHeaders: true });
  });
});
