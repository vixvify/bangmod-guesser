import { describe, expect, it, vi } from "vitest";
import { betterAuth } from "better-auth";
import { UserRole } from "@/core/domain/user";

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
  it("uses the existing USER and ADMIN roles for admin management", () => {
    const options = vi.mocked(betterAuth).mock.calls[0]?.[0];
    const adminPlugin = options?.plugins?.find((plugin) => plugin.id === "admin");

    expect(adminPlugin).toBeDefined();
    expect(adminPlugin?.options).toMatchObject({
      defaultRole: UserRole.USER,
      adminRoles: [UserRole.ADMIN],
    });
    expect(adminPlugin?.schema?.user?.fields).toHaveProperty("banned");
    expect(adminPlugin?.schema?.user?.fields.role).toMatchObject({ input: false });
    expect(options?.hooks?.before).toBeDefined();
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

  it("rejects multi-role assignments and protected user updates", async () => {
    const options = vi.mocked(betterAuth).mock.calls[0]?.[0];
    const before = options?.hooks?.before as
      | ((ctx: { path: string; body: { role?: unknown; data?: unknown } }) => Promise<void>)
      | undefined;

    if (!before) throw new Error("Better Auth guard is missing");

    await expect(
      before({ path: "/admin/set-role", body: { role: [UserRole.ADMIN] } }),
    ).rejects.toThrow("Role must be USER or ADMIN");
    await expect(
      before({ path: "/admin/update-user", body: { data: { email: "new@example.com" } } }),
    ).rejects.toThrow("Only username can be updated");
    await expect(
      before({ path: "/admin/update-user", body: { data: { name: "Student" } } }),
    ).resolves.toBeUndefined();
    await expect(
      before({ path: "/admin/ban-user", body: {} }),
    ).resolves.toBeUndefined();
  });
});
