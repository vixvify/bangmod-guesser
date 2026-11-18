import { beforeEach, describe, expect, it, vi } from "vitest";
import { APIError } from "better-auth/api";

const {
  signInEmail,
  signUpEmail,
  signInSocial,
  signOut,
  updateUser,
  requestPasswordReset,
  resetPassword,
  findBanExpiryByEmail,
} = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  signUpEmail: vi.fn(),
  signInSocial: vi.fn(),
  signOut: vi.fn(),
  updateUser: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  findBanExpiryByEmail: vi.fn(),
}));

vi.mock("@/features/auth/server/auth", () => ({
  auth: { api: { signInEmail, signUpEmail, signInSocial, signOut, updateUser, requestPasswordReset, resetPassword } },
}));

import { AuthAdapter } from "@/features/auth/server/auth.adapter";

describe("AuthAdapter", () => {
  const adapter = new AuthAdapter({ findBanExpiryByEmail });
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
    expect(findBanExpiryByEmail).not.toHaveBeenCalled();
  });

  it("includes the ban expiry for a temporarily suspended account", async () => {
    const banExpires = new Date("2026-11-18T00:00:00.000Z");
    signInEmail.mockRejectedValue(
      APIError.from("FORBIDDEN", {
        message: "You have been banned",
        code: "BANNED_USER",
      }),
    );
    findBanExpiryByEmail.mockResolvedValue(banExpires);

    await expect(
      adapter.signIn(headers, { email: "a@example.com", password: "Password1" }),
    ).rejects.toMatchObject({
      status: 403,
      code: "BANNED_USER",
      data: { banExpires: banExpires.toISOString() },
    });

    expect(findBanExpiryByEmail).toHaveBeenCalledWith("a@example.com");
  });

  it("returns null expiry for a permanently suspended account", async () => {
    signInEmail.mockRejectedValue(
      APIError.from("FORBIDDEN", {
        message: "You have been banned",
        code: "BANNED_USER",
      }),
    );
    findBanExpiryByEmail.mockResolvedValue(null);

    await expect(
      adapter.signIn(headers, { email: "a@example.com", password: "Password1" }),
    ).rejects.toMatchObject({
      status: 403,
      code: "BANNED_USER",
      data: { banExpires: null },
    });
  });

  it("returns null expiry when the banned user cannot be found", async () => {
    signInEmail.mockRejectedValue(
      APIError.from("FORBIDDEN", {
        message: "You have been banned",
        code: "BANNED_USER",
      }),
    );
    findBanExpiryByEmail.mockResolvedValue(null);

    await expect(
      adapter.signIn(headers, { email: "a@example.com", password: "Password1" }),
    ).rejects.toMatchObject({
      status: 403,
      code: "BANNED_USER",
      data: { banExpires: null },
    });
  });

  it("preserves the banned-user error when fetching the expiry fails", async () => {
    signInEmail.mockRejectedValue(
      APIError.from("FORBIDDEN", {
        message: "You have been banned",
        code: "BANNED_USER",
      }),
    );
    findBanExpiryByEmail.mockRejectedValue(new Error("Database connection failed"));

    await expect(
      adapter.signIn(headers, { email: "a@example.com", password: "Password1" }),
    ).rejects.toMatchObject({
      status: 403,
      code: "BANNED_USER",
      data: { banExpires: null },
    });
  });

  it("does not query the user when login fails for another reason", async () => {
    const error = new Error("Invalid credentials");
    signInEmail.mockRejectedValue(error);

    await expect(
      adapter.signIn(headers, { email: "a@example.com", password: "Password1" }),
    ).rejects.toBe(error);

    expect(findBanExpiryByEmail).not.toHaveBeenCalled();
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

  it("updates the authenticated user's name and returns refreshed cookies", async () => {
    const responseHeaders = new Headers({ "set-cookie": "session=updated; HttpOnly" });
    updateUser.mockResolvedValue({ headers: responseHeaders });
    expect(await adapter.updateUsername(headers, { username: "New name" })).toBe(responseHeaders);
    expect(updateUser).toHaveBeenCalledWith({
      body: { name: "New name" }, headers, returnHeaders: true,
    });
  });

  it("requests a password reset with the email and redirect URL", async () => {
    requestPasswordReset.mockResolvedValue(undefined);
    const input = { email: "a@example.com" };
    const redirectTo = "http://localhost:3000/reset-password";
    await adapter.requestPasswordReset(headers, input, redirectTo);
    expect(requestPasswordReset).toHaveBeenCalledWith({
      body: { email: input.email, redirectTo }, headers,
    });
  });

  it("resets the password using the token and new password", async () => {
    resetPassword.mockResolvedValue(undefined);
    const token = "reset-token";
    const input = { password: "NewPassword1", confirmPassword: "NewPassword1" };
    await adapter.resetPassword(headers, token, input);
    expect(resetPassword).toHaveBeenCalledWith({
      body: { newPassword: input.password, token }, headers,
    });
  });
});
