import { describe, expect, it, vi } from "vitest";
import type { AuthPort } from "@/features/auth/server/auth.port";
import { AuthService } from "@/features/auth/server/auth.service";
import { APIError } from "better-auth/api";
import { config } from "@/shared/config/runtime";
import { AppRoutes } from "@/shared/routes/routes";

const createAuthAdapter = (overrides: Partial<AuthPort> = {}): AuthPort => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  googleSignIn: vi.fn(),
  updateUsername: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  ...overrides,
});

describe("AuthService", () => {
  it("converts a provider failure to an application error", async () => {
    const adapter = createAuthAdapter({
      signIn: vi.fn().mockRejectedValue(new APIError("UNAUTHORIZED")),
    })
    await expect(new AuthService(adapter).signIn(new Headers(), {
      email: "a@example.com", password: "Password1",
    })).rejects.toMatchObject({ name: "AppError", status: 401, message: "Sign in failed" });
  });

  it("rejects a Google sign-in response without a redirect URL", async () => {
    const adapter = createAuthAdapter({
      googleSignIn: vi.fn().mockResolvedValue({ url: undefined, headers: new Headers() }),
    })
    await expect(new AuthService(adapter).googleSignIn(new Headers(), "/", "/login"))
      .rejects.toMatchObject({ name: "AppError", status: 400, message: "Google sign in failed" });
  });

  it("converts an update-username provider failure to an application error", async () => {
    const adapter = createAuthAdapter({
      updateUsername: vi.fn().mockRejectedValue(new APIError("INTERNAL_SERVER_ERROR")),
    })
    await expect(new AuthService(adapter).updateUsername(new Headers(), {
      username: "New name",
    })).rejects.toMatchObject({ name: "AppError", status: 500, message: "Update username failed" });
  });

  it("passes the authenticated request and username to the adapter", async () => {
    const headers = new Headers({ cookie: "session=old" });
    const responseHeaders = new Headers();
    const adapter = createAuthAdapter({
      updateUsername: vi.fn().mockResolvedValue(responseHeaders),
    })
    expect(await new AuthService(adapter).updateUsername(headers, { username: "New name" })).toBe(responseHeaders);
    expect(adapter.updateUsername).toHaveBeenCalledWith(headers, { username: "New name" });
  });

  it("keeps Google callbacks on local paths", async () => {
    const adapter = createAuthAdapter({
      googleSignIn: vi.fn().mockResolvedValue({ url: "https://accounts.google.com/", headers: new Headers() }),
    })
    const service = new AuthService(adapter);

    const headers = new Headers();
    await service.googleSignIn(headers, "//evil.example", "/login?callbackUrl=%2Fgame");

    expect(adapter.googleSignIn).toHaveBeenCalledWith(headers, "/", "/login?callbackUrl=%2Fgame");
  });

  it("passes the email and reset-password redirect URL to the adapter", async () => {
    const headers = new Headers({ cookie: "session=old" });
    const input = { email: "a@example.com" };

    const adapter = createAuthAdapter();
    const service = new AuthService(adapter);

    await service.requestPasswordReset(headers, input);

    expect(adapter.requestPasswordReset).toHaveBeenCalledWith(
      headers,
      input,
      new URL(AppRoutes.resetPassword, config.authUrl).toString(),
    );
  });

  it("converts a password-reset request failure to an application error", async () => {
    const adapter = createAuthAdapter({
      requestPasswordReset: vi.fn().mockRejectedValue(
        new APIError("INTERNAL_SERVER_ERROR"),
      ),
    });

    await expect(new AuthService(adapter).requestPasswordReset(new Headers(), {email: "a@example.com"}),
    ).rejects.toMatchObject({name: "AppError", status: 500, message: "Request password reset failed"});
  });

  it("passes the token and new password to the adapter", async () => {
    const headers = new Headers({ cookie: "session=old" });
    const token = "reset-token";
    const input = {
      password: "NewPassword1",
      confirmPassword: "NewPassword1",
    };

    const adapter = createAuthAdapter();
    const service = new AuthService(adapter);

    await service.resetPassword(headers, token, input);

    expect(adapter.resetPassword).toHaveBeenCalledWith(headers, token, input);
  });

  it("converts a password-reset failure to an application error", async () => {
    const adapter = createAuthAdapter({
      resetPassword: vi.fn().mockRejectedValue(
        new APIError("BAD_REQUEST"),
      ),
    });

    await expect(new AuthService(adapter).resetPassword(
      new Headers(), "invalid-token", {password: "NewPassword1", confirmPassword: "NewPassword1"},
    )).rejects.toMatchObject({name: "AppError", status: 400, message: "Reset password failed",
    });
  });
});