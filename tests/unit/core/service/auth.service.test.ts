import { describe, expect, it, vi } from "vitest";
import type { AuthPort } from "@/features/auth/server/auth.port";
import { AuthService } from "@/features/auth/server/auth.service";
import { APIError } from "better-auth/api";

describe("AuthService", () => {
  it("converts a provider failure to an application error", async () => {
    const adapter = {
      signIn: vi.fn().mockRejectedValue(new APIError("UNAUTHORIZED")),
      signUp: vi.fn(), signOut: vi.fn(), googleSignIn: vi.fn(), updateUsername: vi.fn(),
    } satisfies AuthPort;
    await expect(new AuthService(adapter).signIn(new Headers(), {
      email: "a@example.com", password: "Password1",
    })).rejects.toMatchObject({ name: "AppError", status: 401, message: "Sign in failed" });
  });

  it("rejects a Google sign-in response without a redirect URL", async () => {
    const adapter = {
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), updateUsername: vi.fn(),
      googleSignIn: vi.fn().mockResolvedValue({ url: undefined, headers: new Headers() }),
    } satisfies AuthPort;
    await expect(new AuthService(adapter).googleSignIn(new Headers(), "/", "/login"))
      .rejects.toMatchObject({ name: "AppError", status: 400, message: "Google sign in failed" });
  });

  it("converts an update-username provider failure to an application error", async () => {
    const adapter = {
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), googleSignIn: vi.fn(),
      updateUsername: vi.fn().mockRejectedValue(new APIError("INTERNAL_SERVER_ERROR")),
    } satisfies AuthPort;
    await expect(new AuthService(adapter).updateUsername(new Headers(), {
      username: "New name",
    })).rejects.toMatchObject({ name: "AppError", status: 500, message: "Update username failed" });
  });
  it("passes the authenticated request and username to the adapter", async () => {
    const headers = new Headers({ cookie: "session=old" });
    const responseHeaders = new Headers();
    const adapter = {
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), googleSignIn: vi.fn(),
      updateUsername: vi.fn().mockResolvedValue(responseHeaders),
    } satisfies AuthPort;
    expect(await new AuthService(adapter).updateUsername(headers, { username: "New name" })).toBe(responseHeaders);
    expect(adapter.updateUsername).toHaveBeenCalledWith(headers, { username: "New name" });
  });

  it("keeps Google callbacks on local paths", async () => {
    const adapter = {
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateUsername: vi.fn(),
      googleSignIn: vi.fn().mockResolvedValue({ url: "https://accounts.google.com/", headers: new Headers() }),
    } satisfies AuthPort;
    const service = new AuthService(adapter);

    const headers = new Headers();
    await service.googleSignIn(headers, "//evil.example", "/login?callbackUrl=%2Fgame");

    expect(adapter.googleSignIn).toHaveBeenCalledWith(headers, "/", "/login?callbackUrl=%2Fgame");
  });
});
