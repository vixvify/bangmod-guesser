import { describe, expect, it, vi } from "vitest";
import { createAuthClient } from "better-auth/react";

vi.mock("better-auth/react", () => ({ createAuthClient: vi.fn(() => ({})) }));

import "@/lib/auth-client";

describe("Better Auth client configuration", () => {
  it("exposes the admin client plugin for role management", () => {
    const options = vi.mocked(createAuthClient).mock.calls[0]?.[0];

    expect(options?.plugins?.some((plugin) => plugin.id === "admin-client")).toBe(true);
  });
});
