import { describe, expect, it, vi } from "vitest";
import type { AuthPort } from "@/features/auth/server/auth.port";
import { AuthService } from "@/features/auth/server/auth.service";
import { APIError } from "better-auth/api";

describe("AuthService", () => {
  it("converts a provider failure to an application error", async () => {
    const adapter = {
      signIn: vi.fn().mockRejectedValue(new APIError("UNAUTHORIZED")),
      signUp: vi.fn(), signOut: vi.fn(), googleSignIn: vi.fn(),
    } satisfies AuthPort;
    await expect(new AuthService(adapter).signIn(new Headers(), {
      email: "a@example.com", password: "Password1",
    })).rejects.toMatchObject({ name: "AppError", status: 401, message: "Sign in failed" });
  });

  it("rejects a Google sign-in response without a redirect URL", async () => {
    const adapter = {
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
      googleSignIn: vi.fn().mockResolvedValue({ url: undefined, headers: new Headers() }),
    } satisfies AuthPort;
    await expect(new AuthService(adapter).googleSignIn(new Headers(), "/", "/login"))
      .rejects.toMatchObject({ name: "AppError", status: 400, message: "Google sign in failed" });
  });
  it("keeps Google callbacks on local paths", async () => {
    const adapter = {
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      googleSignIn: vi.fn().mockResolvedValue({ url: "https://accounts.google.com/", headers: new Headers() }),
    } satisfies AuthPort;
    const service = new AuthService(adapter);

    const headers = new Headers();
    await service.googleSignIn(headers, "//evil.example", "/login?callbackUrl=%2Fgame");

    expect(adapter.googleSignIn).toHaveBeenCalledWith(headers, "/", "/login?callbackUrl=%2Fgame");
  });
});
