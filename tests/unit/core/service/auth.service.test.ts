import { describe, expect, it, vi } from "vitest";
import type { AuthPort } from "@/features/auth/server/auth.port";
import { AuthService } from "@/features/auth/server/auth.service";

describe("AuthService", () => {
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
