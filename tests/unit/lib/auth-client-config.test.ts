import { describe, expect, it } from "vitest";
import { authClient } from "@/lib/auth-client";

describe("Better Auth admin client", () => {
  it("exposes the five user-management methods for client services", () => {
    for (const method of ["getUser", "updateUser", "banUser", "unbanUser", "setRole"] as const) {
      expect(authClient.admin[method]).toBeTypeOf("function");
    }
  });
});
