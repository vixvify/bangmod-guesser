import { describe, expect, it, vi } from "vitest";
import { betterAuth } from "better-auth";
import { UserRole } from "@/core/domain/user";
import { AdminPaths } from "@/routes/api/admin.routes";

vi.mock("better-auth", () => ({ betterAuth: vi.fn(() => ({})) }));
vi.mock("better-auth/adapters/prisma", () => ({ prismaAdapter: vi.fn(() => ({})) }));
vi.mock("better-auth/api", () => ({
  createAuthMiddleware: (handler: unknown) => handler,
  APIError: class extends Error {
    constructor(_status: string, options: { message: string }) {
      super(options.message);
    }
  },
}));
vi.mock("@/lib/config", () => ({
  config: {
    authSecret: "test-secret",
    authUrl: "http://localhost:3000",
    googleOAuth: { clientId: "google-client-id", clientSecret: "google-client-secret" },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import "@/lib/auth";

describe("Better Auth configuration", () => {
  it("registers admin endpoints with the existing uppercase roles", () => {
    const options = vi.mocked(betterAuth).mock.calls[0]?.[0];
    const adminPlugin = options?.plugins?.find((plugin) => plugin.id === "admin");

    expect(adminPlugin?.options).toMatchObject({
      defaultRole: UserRole.USER,
      adminRoles: [UserRole.ADMIN],
    });
    expect(adminPlugin?.schema?.user?.fields).toHaveProperty("banned");
    expect(adminPlugin?.schema?.session?.fields).toHaveProperty("impersonatedBy");
  });

  it("rejects role arrays and changes beyond username through admin endpoints", async () => {
    const options = vi.mocked(betterAuth).mock.calls[0]?.[0];
    const before = options?.hooks?.before as
      | ((ctx: { path: string; body: { role?: unknown; data?: unknown } }) => Promise<void>)
      | undefined;

    if (!before) throw new Error("Admin request guard is missing");

    await expect(before({ path: AdminPaths.setRole, body: { role: [UserRole.ADMIN] } }))
      .rejects.toThrow("Role must be USER or ADMIN");
    await expect(before({ path: AdminPaths.setRole, body: { role: UserRole.ADMIN } }))
      .resolves.toBeUndefined();
    await expect(before({ path: AdminPaths.updateUser, body: { data: { email: "new@example.com" } } }))
      .rejects.toThrow("Only a valid username can be updated");
    await expect(before({ path: AdminPaths.updateUser, body: { data: { name: "Student" } } }))
      .resolves.toBeUndefined();
  });

  it("creates an account without signing the user in automatically", () => {
    expect(betterAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        emailAndPassword: { enabled: true, autoSignIn: false },
      }),
    );
  });

  it("configures Google sign-in with server-side OAuth credentials", () => {
    expect(betterAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        socialProviders: {
          google: { clientId: "google-client-id", clientSecret: "google-client-secret" },
        },
      }),
    );
  });
});
