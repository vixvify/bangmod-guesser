import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import {
    DELETE,
    PATCH,
} from "@/app/api/users/[id]/route";
import { UserRole } from "@/core/domain/user";
import { AppError } from "@/core/errors/app.error";
const { updateUser, deleteUser } = vi.hoisted(() => ({ updateUser: vi.fn(), deleteUser: vi.fn() }));
vi.mock("@/infrastructure/container", () => ({ userService: { updateUser, deleteUser } }));
import { requireAuth } from "@/lib/auth-check";

vi.mock("next/headers", () => ({
    headers: vi.fn().mockResolvedValue(new Headers())
}));

vi.mock("@/lib/auth-check", () => ({requireAuth: vi.fn()}));

vi.mock("@/lib/role-check", () => ({roleCheck: vi.fn()}));

const createContext = (id: string) => ({
    params: Promise.resolve({ id })
});

const createPatchRequest = (body: unknown) =>
    new Request(
        "http://localhost/api/users/user-1",
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        },
    );

const validUserData = {
    name: "Updated User",
    role: UserRole.USER,
    status: "ACTIVE" as const,
    suspension: {
        startDate: null,
        endDate: null,
    },
    reason: ""
};

describe("PATCH /api/users/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(requireAuth).mockResolvedValue({
            id: "admin-1",
            role: UserRole.ADMIN
        } as never);
    });

    it("should update user successfully", async () => {
        updateUser.mockResolvedValue({
                id: "user-1",
                name: "Updated User",
                email: "user@example.com",
                image: null,
                role: UserRole.USER,
                status: "ACTIVE",
                gameCount: 0,
                suspension: { startDate: null, endDate: null },
                reason: "",
            });

        const request = createPatchRequest(validUserData);

        const response = await PATCH(
            request,
            createContext("user-1")
        );

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body.data).toMatchObject({ id: "user-1", name: "Updated User" });

        expect(body.statusCode).toBe("SUCCESS");

        expect(updateUser).toHaveBeenCalledWith(
            expect.any(Headers),
            "user-1",
            validUserData
        );
    });

    it("should return 400 for invalid user id", async () => {
        const request = createPatchRequest(validUserData);

        const response = await PATCH(
            request,
            createContext("")
        );

        expect(response.status).toBe(400);

        const body = await response.json();

        expect(body.statusCode).toBe("ERROR");
    });

    it("should return 400 for invalid user data", async () => {
        const request = createPatchRequest({
            ...validUserData,
            name: ""
        });

        const response = await PATCH(
            request,
            createContext("user-1")
        );

        expect(response.status).toBe(400);

        const body = await response.json();

        expect(body.statusCode).toBe("ERROR");
    });

    it("should return error response when service fails", async () => {
        updateUser.mockRejectedValue(
            new AppError(
                "Failed to update user",
                400
            )
        );

        const request = createPatchRequest(validUserData);

        const response = await PATCH(
            request,
            createContext("user-1"),
        );

        expect(response.status).toBe(400);

        const body = await response.json();

        expect(body.error).toBe("Failed to update user");

        expect(body.statusCode).toBe("ERROR");
    });
});

describe("DELETE /api/users/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(requireAuth).mockResolvedValue({
            id: "admin-1",
            role: UserRole.ADMIN
        } as never);
    });

    it("should delete user successfully", async () => {
        deleteUser.mockResolvedValue(undefined);

        const request = new Request(
            "http://localhost/api/users/user-1",
            {
                method: "DELETE"
            }
        );

        const response = await DELETE(
            request,
            createContext("user-1")
        );

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body.data).toEqual({
            success: true,
            userId: "user-1"
        });

        expect(body.statusCode).toBe("SUCCESS");

        expect(deleteUser).toHaveBeenCalledWith(
            expect.any(Headers),
            "user-1"
        );
    });

    it("should return 400 for invalid user id", async () => {
        const request = new Request(
            "http://localhost/api/users/",
            {
                method: "DELETE"
            }
        );

        const response = await DELETE(
            request,
            createContext("")
        );

        expect(response.status).toBe(400);

        const body = await response.json();

        expect(body.statusCode).toBe("ERROR");
    });

    it("should return error response when service fails", async () => {
        deleteUser.mockRejectedValue(
            new AppError(
                "Failed to delete user",
                400
            )
        );

        const request = new Request(
            "http://localhost/api/users/user-1",
            {
                method: "DELETE",
            },
        );

        const response = await DELETE(
            request,
            createContext("user-1"),
        );

        expect(response.status).toBe(400);

        const body = await response.json();

        expect(body.error).toBe("Failed to delete user");

        expect(body.statusCode).toBe("ERROR");
    });
});
