import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as register } from "@/app/api/auth/register/route";
import { authService } from "@/infrastructure/container";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  disconnectTestDatabase,
  resetTestDatabase,
} from "../../helpers/test-database";
import { validLogin, validRegistration } from "../../fixtures/users";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/auth", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe.sequential("Auth API routes", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it("registers a user in PostgreSQL and does not expose its password", async () => {
    const response = await register(jsonRequest(validRegistration));
    const payload = await response.json();
    const persistedUser = await prisma.user.findUnique({
      where: { email: validRegistration.email },
      include: { role: true },
    });

    expect(response.status).toBe(201);
    expect(payload).toEqual({
      data: {
        id: expect.any(String),
        name: validRegistration.name,
        email: validRegistration.email,
        role: "USER",
      },
      status: 201,
      statusCode: "CREATED",
    });
    expect(persistedUser?.role.name).toBe("USER");
    expect(persistedUser?.password).not.toBe(validRegistration.password);
    await expect(
      verifyPassword(validRegistration.password, persistedUser?.password ?? ""),
    ).resolves.toBe(true);
  });

  it("returns a conflict for a duplicate registration", async () => {
    await authService.register(validRegistration);

    const response = await register(jsonRequest(validRegistration));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: "Email is already registered",
      status: 409,
      statusCode: "ERROR",
    });
  });

  it("logs in a persisted user and creates a session cookie", async () => {
    await authService.register(validRegistration);

    const response = await login(jsonRequest(validLogin));
    const payload = await response.json();
    const sessionCount = await prisma.session.count();

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
    expect(sessionCount).toBe(1);
  });
});
