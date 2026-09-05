import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/infrastructure/container", () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
  },
  sessionService: {
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

import { POST as login } from "@/app/api/auth/login/route";
import { POST as register } from "@/app/api/auth/register/route";
import { authService } from "@/infrastructure/container";
import { AppError } from "@/core/errors/app.error";
import { validLogin, validRegistration } from "../../fixtures/users";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/auth", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const user = {
  id: "user_1",
  name: validRegistration.name,
  email: validRegistration.email,
  role: "USER",
};

describe("Auth API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a public user after registration", async () => {
    vi.mocked(authService.register).mockResolvedValue(user);

    const response = await register(jsonRequest(validRegistration));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual({
      data: user,
      status: 201,
      statusCode: "CREATED",
    });
    expect(authService.register).toHaveBeenCalledWith(validRegistration);
  });

  it("returns a conflict for a duplicate registration", async () => {
    vi.mocked(authService.register).mockRejectedValue(
      new AppError("Email is already registered", 409),
    );

    const response = await register(jsonRequest(validRegistration));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: "Email is already registered",
      status: 409,
      statusCode: "ERROR",
    });
  });

  it("creates an HTTP-only session cookie after login", async () => {
    vi.mocked(authService.login).mockResolvedValue(user);
    const { sessionService } = await import("@/infrastructure/container");
    vi.mocked(sessionService.create).mockResolvedValue("session-token");

    const response = await login(jsonRequest(validLogin));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      data: {
        email: validRegistration.email,
        role: "USER",
      },
      status: 200,
      statusCode: "SUCCESS",
    });
    expect(payload.data).not.toHaveProperty("password");
    expect(response.headers.get("set-cookie")).toContain("accessToken=");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(sessionService.create).toHaveBeenCalledWith(user.id);
  });
});
