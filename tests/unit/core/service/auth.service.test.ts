import { describe, expect, it } from "vitest";
import { AuthService } from "@/core/service/auth.service";
import { hashPassword } from "@/lib/password";
import { createUserModel, validLogin, validRegistration } from "../../../fixtures/users";
import { createAuthRepositoryMock } from "../../../mocks/auth.repository.mock";

describe("AuthService", () => {
  it("registers a normalized user and returns no password", async () => {
    const repository = createAuthRepositoryMock();
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockImplementation(async (data) =>
      createUserModel({ ...data, password: data.password }),
    );
    const service = new AuthService(repository);

    const user = await service.register({
      ...validRegistration,
      name: "  KMUTT Student  ",
      email: "  STUDENT@EXAMPLE.COM  ",
    });

    expect(repository.findByEmail).toHaveBeenCalledWith("student@example.com");
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "KMUTT Student",
        email: "student@example.com",
        password: expect.stringMatching(/^scrypt:/),
      }),
    );
    expect(user).toEqual({
      id: "user_1",
      name: "KMUTT Student",
      email: "student@example.com",
      role: "USER",
    });
    expect(user).not.toHaveProperty("password");
  });

  it("rejects an already registered email", async () => {
    const repository = createAuthRepositoryMock();
    repository.findByEmail.mockResolvedValue(createUserModel());
    const service = new AuthService(repository);

    await expect(service.register(validRegistration)).rejects.toMatchObject({
      message: "Email is already registered",
      status: 409,
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("logs in with valid credentials and returns no password", async () => {
    const repository = createAuthRepositoryMock();
    repository.findByEmail.mockResolvedValue(
      createUserModel({ password: await hashPassword(validLogin.password) }),
    );
    const service = new AuthService(repository);

    await expect(service.login(validLogin)).resolves.toEqual({
      id: "user_1",
      name: "KMUTT Student",
      email: "student@example.com",
      role: "USER",
    });
  });

  it("rejects invalid credentials", async () => {
    const repository = createAuthRepositoryMock();
    repository.findByEmail.mockResolvedValue(null);
    const service = new AuthService(repository);

    await expect(service.login(validLogin)).rejects.toMatchObject({
      message: "Invalid email or password",
      status: 401,
    });
  });
});
