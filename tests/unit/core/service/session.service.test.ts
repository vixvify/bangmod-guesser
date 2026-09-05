import { afterEach, describe, expect, it, vi } from "vitest";
import { SessionService } from "@/core/service/session.service";
import { createUserModel } from "../../../fixtures/users";
import { createSessionRepositoryMock } from "../../../mocks/session.repository.mock";

describe("SessionService", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a token with a seven-day expiry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    const repository = createSessionRepositoryMock();
    repository.create.mockResolvedValue(undefined);
    const service = new SessionService(repository);

    const token = await service.create("user_1");

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(repository.create).toHaveBeenCalledWith(
      "user_1",
      token,
      new Date("2026-01-08T00:00:00.000Z"),
    );
  });

  it("returns null without a token and does not query the repository", async () => {
    const repository = createSessionRepositoryMock();
    const service = new SessionService(repository);

    await expect(service.getCurrentUser(null)).resolves.toBeNull();
    expect(repository.findUserByToken).not.toHaveBeenCalled();
  });

  it("maps the current user to the public response", async () => {
    const repository = createSessionRepositoryMock();
    repository.findUserByToken.mockResolvedValue(createUserModel());
    const service = new SessionService(repository);

    await expect(service.getCurrentUser("token_1")).resolves.toEqual({
      id: "user_1",
      name: "KMUTT Student",
      email: "student@example.com",
      role: "USER",
    });
  });

  it("deletes a present token only", async () => {
    const repository = createSessionRepositoryMock();
    repository.deleteByToken.mockResolvedValue(undefined);
    const service = new SessionService(repository);

    await service.delete(null);
    await service.delete("token_1");

    expect(repository.deleteByToken).toHaveBeenCalledTimes(1);
    expect(repository.deleteByToken).toHaveBeenCalledWith("token_1");
  });
});
