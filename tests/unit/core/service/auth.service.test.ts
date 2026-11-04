import { describe, expect, it, vi } from "vitest";
import type { AuthPort } from "@/features/auth/server/auth.port";
import { AuthService } from "@/features/auth/server/auth.service";

describe("AuthService", () => {
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
