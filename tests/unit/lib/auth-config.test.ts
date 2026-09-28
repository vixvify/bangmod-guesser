import { describe, expect, it, vi } from "vitest";
import { betterAuth } from "better-auth";

vi.mock("better-auth", () => ({ betterAuth: vi.fn(() => ({})) }));
vi.mock("better-auth/adapters/prisma", () => ({ prismaAdapter: vi.fn(() => ({})) }));
vi.mock("@/config", () => ({
  config: { authSecret: "test-secret", authUrl: "http://localhost:3000" },
}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import "@/lib/auth";

describe("Better Auth configuration", () => {
  it("creates an account without signing the user in automatically", () => {
    expect(betterAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        emailAndPassword: { enabled: true, autoSignIn: false },
      }),
    );
  });
});
