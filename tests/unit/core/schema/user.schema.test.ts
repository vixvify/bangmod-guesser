import { describe, expect, it } from "vitest";
import {
    SearchUserQuerySchema,
    UserFormSchema,
    UserIdSchema,
} from "@/core/schema/user.schema";

describe("UserFormSchema", () => {
  it("should accept ACTIVE user", () => {
    const result = UserFormSchema.safeParse({
      name: "John Doe",
      role: "USER",
      status: "ACTIVE",
      suspension: {
        startDate: null,
        endDate: null,
      },
      reason: "",
    });
    expect(result.success).toBe(true);
  });

  it("should accept SUSPENDED user without end date", () => {
    const result = UserFormSchema.safeParse({
      name: "John Doe",
      role: "USER",
      status: "SUSPENDED",
      suspension: {
        startDate: null,
        endDate: null,
      },
      reason: "Violation",
    });
    expect(result.success).toBe(true);
  });

  it("should accept SUSPENDED user with end date", () => {
    const result = UserFormSchema.safeParse({
      name: "John Doe",
      role: "USER",
      status: "SUSPENDED",
      suspension: {
        startDate: null,
        endDate: "2099-12-31",
      },
      reason: "Violation",
    });
    expect(result.success).toBe(true);
  });

  it("should accept INACTIVE user", () => {
    const result = UserFormSchema.safeParse({
      name: "John Doe",
      role: "USER",
      status: "INACTIVE",
      suspension: {
        startDate: null,
        endDate: null,
      },
      reason: "",
    });
    expect(result.success).toBe(true);
  });

  it("should reject TEMPORARY status", () => {
    const result = UserFormSchema.safeParse({
      name: "John Doe",
      role: "USER",
      status: "TEMPORARY",
      suspension: {
        startDate: null,
        endDate: null,
      },
      reason: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid username", () => {
    const result = UserFormSchema.safeParse({
      name: "",
      role: "USER",
      status: "ACTIVE",
      suspension: {
        startDate: null,
        endDate: null,
      },
      reason: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("SearchUserQuerySchema", () => {
  it("should use default page and limit", () => {
    const result = SearchUserQuerySchema.parse({});
    expect(result).toEqual({ page: 1, limit: 9 });
    });

  it("should parse page and limit from query string", () => {
    const result = SearchUserQuerySchema.parse({ page: "2", limit: "20" });
    expect(result).toEqual({ page: 2, limit: 20 });
  });

  it("should accept role and status filters", () => {
    const result =SearchUserQuerySchema.parse({ page: "1", limit: "10", role: "ADMIN", status: "SUSPENDED" });
    expect(result).toEqual({ page: 1, limit: 10, role: "ADMIN", status: "SUSPENDED" });
  });

  it("should reject invalid role", () => {
    const result = SearchUserQuerySchema.safeParse({ role: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid status", () => {
    const result = SearchUserQuerySchema.safeParse({ status: "TEMPORARY" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid page", () => {
    const result = SearchUserQuerySchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("should reject limit over 100", () => {
    const result = SearchUserQuerySchema.safeParse({ limit: "101" });
    expect(result.success).toBe(false);
  });
});

describe("UserIdSchema", () => {
  it("should accept a valid user id", () => {
    expect(UserIdSchema.safeParse("user-123").success).toBe(true);
  });

  it("should reject an empty user id", () => {
    expect(UserIdSchema.safeParse("").success).toBe(false);
  });

  it("should reject a whitespace-only user id", () => {
    expect(UserIdSchema.safeParse("   ").success).toBe(false);
  });
});