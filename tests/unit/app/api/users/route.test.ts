import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import { GET } from "@/app/api/users/route";
import { UserRole } from "@/core/domain/user";
import { AppError } from "@/core/errors/app.error";
import { UserService } from "@/core/service/user.service";

vi.mock("next/headers", () => ({
    headers: vi.fn().mockResolvedValue(
        new Headers(),
    ),
}));

vi.mock("@/lib/auth-check", () => ({
    requireAuth: vi.fn(),
}));

vi.mock("@/lib/role-check", () => ({
    roleCheck: vi.fn(),
}));

import { requireAuth } from "@/lib/auth-check";

describe("GET /api/users", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(requireAuth).mockResolvedValue({
            id: "admin-1",
            role: UserRole.ADMIN,
        } as never);
    });

    it("should return users successfully", async () => {
        const getUsers = vi
            .spyOn(UserService.prototype, "getUsers")
            .mockResolvedValue({
                users: [],
                total: 0,
                page: 1,
                limit: 9,
            });

        const request = new Request(
            "http://localhost/api/users",
        );

        const response = await GET(request);

        expect(response.status).toBe(200);

        expect(getUsers).toHaveBeenCalledWith(
            expect.any(Headers),
            1,
            9,
            undefined,
            undefined,
        );
    });

    it("should pass query parameters to user service", async () => {
        const getUsers = vi
            .spyOn(UserService.prototype, "getUsers")
            .mockResolvedValue({
                users: [],
                total: 5,
                page: 2,
                limit: 20,
            });

        const request = new Request(
            "http://localhost/api/users?page=2&limit=20&role=ADMIN&status=SUSPENDED",
        );

        const response = await GET(request);

        expect(response.status).toBe(200);

        expect(getUsers).toHaveBeenCalledWith(
            expect.any(Headers),
            2,
            20,
            UserRole.ADMIN,
            "SUSPENDED",
        );
    });

    it("should return 400 for invalid pagination", async () => {
        const request = new Request(
            "http://localhost/api/users?page=0",
        );

        const response = await GET(request);

        expect(response.status).toBe(400);

        const body = await response.json();

        expect(body.statusCode).toBe("ERROR");
    });

    it("should return 400 for invalid role", async () => {
        const request = new Request(
            "http://localhost/api/users?role=INVALID",
        );

        const response = await GET(request);

        expect(response.status).toBe(400);

        const body = await response.json();

        expect(body.statusCode).toBe("ERROR");
    });

    it("should return 400 for invalid status", async () => {
        const request = new Request(
            "http://localhost/api/users?status=INVALID",
        );

        const response = await GET(request);

        expect(response.status).toBe(400);

        const body = await response.json();

        expect(body.statusCode).toBe("ERROR");
    });

    it("should return error response when service fails", async () => {
        const getUsers = vi
            .spyOn(UserService.prototype, "getUsers")
            .mockRejectedValue(
                new AppError(
                    "Failed to get users",
                    400,
                ),
            );

        const request = new Request(
            "http://localhost/api/users",
        );

        const response = await GET(request);

        expect(response.status).toBe(400);

        const body = await response.json();

        expect(body.error).toBe(
            "Failed to get users",
        );

        expect(body.statusCode).toBe(
            "ERROR",
        );
    });
});