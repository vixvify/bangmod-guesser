import { describe, expect, it, vi } from "vitest";
import { UserRole } from "@/core/domain/user";
import { UserService } from "@/core/service/user.service";
import { UserAdapter } from "@/infrastructure/adapters/user.adapter";

describe("UserService.getUsers", () => {
    it("should pass offset and limit to user adapter", async () => {
        const listUsers = vi.spyOn(
            UserAdapter.prototype,
            "listUsers",
        ).mockResolvedValue({
            users: [],
            total: 20,
            limit: 9,
            offset: 9,
        } as never);

        vi.spyOn(
            UserAdapter.prototype,
            "getUserMetadata",
        ).mockResolvedValue([]);

        const service = new UserService(new UserAdapter());

        const result = await service.getUsers(
            new Headers(),
            2,
            9,
        );

        expect(listUsers).toHaveBeenCalledWith(
            expect.any(Headers),
            undefined,
            9,
            9,
            undefined,
        );

        expect(result).toEqual({
            users: [],
            total: 20,
            page: 2,
            limit: 9,
        });
    });

    it("should pass role filter to user adapter", async () => {
        const listUsers = vi.spyOn(
            UserAdapter.prototype,
            "listUsers",
        ).mockResolvedValue({
            users: [],
            total: 5,
            limit: 9,
            offset: 0,
        } as never);

        vi.spyOn(
            UserAdapter.prototype,
            "getUserMetadata",
        ).mockResolvedValue([]);

        const service = new UserService(new UserAdapter());

        await service.getUsers(
            new Headers(),
            1,
            9,
            UserRole.ADMIN,
        );

        expect(listUsers).toHaveBeenCalledWith(
            expect.any(Headers),
            UserRole.ADMIN,
            0,
            9,
            undefined,
        );
    });

    it("should create user accounts using UserFactory", async () => {
        vi.spyOn(
            UserAdapter.prototype,
            "listUsers",
        ).mockResolvedValue({
            users: [{
                id: "user-1",
                name: "John Doe",
                email: "john@example.com",
                image: null,
                role: "USER",
                banReason: null,
                banExpires: null,
            }],
            total: 1,
            limit: 9,
            offset: 0,
        } as never);

        vi.spyOn(
            UserAdapter.prototype,
            "getUserMetadata",
        ).mockResolvedValue([
            {
                id: "user-1",
                status: "ACTIVE",
                _count: {
                    games: 5,
                },
            },
        ] as never);

        const service = new UserService(new UserAdapter());

        const result = await service.getUsers(
            new Headers(),
        );

        expect(result.users).toEqual([
            {
                id: "user-1",
                name: "John Doe",
                email: "john@example.com",
                image: null,
                role: UserRole.USER,
                status: "ACTIVE",
                gameCount: 5,
                suspension: {
                    startDate: null,
                    endDate: null,
                },
                reason: "",
            },
        ]);
    });

    it("should pass status filter to user adapter", async () => {
        const listUsers = vi.spyOn(
            UserAdapter.prototype,
            "listUsers",
        ).mockResolvedValue({
            users: [],
            total: 3,
            limit: 9,
            offset: 0,
        } as never);

        vi.spyOn(
            UserAdapter.prototype,
            "getUserMetadata",
        ).mockResolvedValue([]);

        const service = new UserService(
            new UserAdapter(),
        );

        await service.getUsers(
            new Headers(),
            1,
            9,
            undefined,
            "SUSPENDED",
        );

        expect(listUsers).toHaveBeenCalledWith(
            expect.any(Headers),
            undefined,
            0,
            9,
            "SUSPENDED",
        );
    });
});