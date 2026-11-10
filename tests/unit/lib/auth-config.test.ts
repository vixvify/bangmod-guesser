import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { betterAuth } from "better-auth";
import { Resend } from "resend";
import { UserRole } from "@/features/users/user";
import { AdminPaths } from "@/features/users/admin.routes";

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

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
vi.mock("resend", () => ({
  Resend: vi.fn(
    class {
      emails = { send: mockSend };
    },
  ),
}));
vi.mock("@/shared/config/runtime", () => ({
  config: {
    authSecret: "test-secret",
    authUrl: "http://localhost:3000",
    googleOAuth: {
      clientId: "google-client-id",
      clientSecret: "google-client-secret",
    },
    resend: {
      apiKey: "test-resend-api-key",
      fromEmail: "onboarding@resend.dev",
    },
  },
}));
vi.mock("@/shared/lib/prisma", () => ({ prisma: {} }));

import "@/features/auth/server/auth";

function getAuthOptions() {
  const options = vi.mocked(betterAuth).mock.calls[0]?.[0];

  if (!options) {
    throw new Error("Better Auth configuration is missing");
  }

  return options;
}

describe("Better Auth configuration", () => {
  beforeEach(() => {
    mockSend.mockReset();
    vi.mocked(Resend).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers admin endpoints with the existing uppercase roles", () => {
    const options = getAuthOptions();
    const adminPlugin = options.plugins?.find((plugin) => plugin.id === "admin");

    expect(adminPlugin?.options).toMatchObject({
      defaultRole: UserRole.USER,
      adminRoles: [UserRole.ADMIN],
    });
    expect(adminPlugin?.schema?.user?.fields).toHaveProperty("banned");
    expect(adminPlugin?.schema?.session?.fields).toHaveProperty("impersonatedBy");
  });

  it("rejects role arrays and changes beyond username through admin endpoints", async () => {
    const options = getAuthOptions();
    const before = options.hooks?.before as
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
        emailAndPassword: expect.objectContaining({
          enabled: true,
          autoSignIn: false,
          resetPasswordTokenExpiresIn: 900,
          sendResetPassword: expect.any(Function),
        }),
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

  it("sends a password reset email through Resend", async () => {
    mockSend.mockResolvedValue({ data: { id: "email_123" }, error: null });

    const callback = getAuthOptions().emailAndPassword?.sendResetPassword;

    if (!callback) throw new Error("Password reset email callback is missing");

    await callback({
      user: { email: "student@example.com" },
      url: "http://localhost:3000/reset-password/token123",
    } as never);

    expect(Resend).toHaveBeenCalledWith("test-resend-api-key");
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "onboarding@resend.dev",
        to: "student@example.com",
        subject: "เปลี่ยนรหัสผ่าน | Bangmod Guesser",
        text: expect.stringContaining(
          "http://localhost:3000/reset-password/token123",
        ),
        html: expect.stringContaining(
          'href="http://localhost:3000/reset-password/token123"',
        ),
      }),
    );
  });

  it("logs an error when Resend returns an error", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mockSend.mockResolvedValue({
      data: null,
      error: { message: "Resend failed" },
    });

    const callback = getAuthOptions().emailAndPassword?.sendResetPassword;

    if (!callback) throw new Error("Password reset email callback is missing");

    await callback({
      user: { email: "student@example.com" },
      url: "http://localhost:3000/reset-password/token123",
    } as never);

    await vi.waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        "Failed to send password reset email:",
        { message: "Resend failed" },
      );
    });
  });

  it("logs an error when Resend rejects", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mockSend.mockRejectedValue(new Error("Network error"));

    const callback = getAuthOptions().emailAndPassword?.sendResetPassword;

    if (!callback) throw new Error("Password reset email callback is missing");

    await callback({
      user: { email: "student@example.com" },
      url: "http://localhost:3000/reset-password/token123",
    } as never);

    await vi.waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        "Failed to send password reset email:",
        expect.objectContaining({ message: "Network error" }),
      );
    });
  });
});
