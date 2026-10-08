import { describe, expect, it, vi, beforeEach } from "vitest";
import { UserRole } from "@/core/domain/user";
import { UserAdapter } from "@/infrastructure/adapters/user.adapter";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

describe("UserAdapter.listUsers", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("should pass offset and limit to Better Auth", async () => {
        const listUsers = vi
            .spyOn(auth.api, "listUsers")
            .mockResolvedValue({
                users: [],
                total: 20,
                limit: 9,
                offset: 9,
            } as never);

        const adapter = new UserAdapter();
        const headers = new Headers();

        await adapter.listUsers(
            headers,
            undefined,
            9,
            9,
        );

        expect(listUsers).toHaveBeenCalledWith({
            query: {
                offset: 9,
                limit: 9,
            },
            headers,
        });
    });

    it("should pass role filter with offset and limit", async () => {
        const listUsers = vi
            .spyOn(auth.api, "listUsers")
            .mockResolvedValue({
                users: [],
                total: 5,
                limit: 9,
                offset: 0,
            } as never);

        const adapter = new UserAdapter();
        const headers = new Headers();

        await adapter.listUsers(
            headers,
            UserRole.ADMIN,
            0,
            9,
        );

        expect(listUsers).toHaveBeenCalledWith({
            query: {
                filterField: "role",
                filterOperator: "eq",
                filterValue: UserRole.ADMIN,
                offset: 0,
                limit: 9,
            },
            headers,
        });
    });

    it("should use default offset and limit", async () => {
        const listUsers = vi
            .spyOn(auth.api, "listUsers")
            .mockResolvedValue({
                users: [],
                total: 0,
                limit: 9,
                offset: 0,
            } as never);

        const adapter = new UserAdapter();
        const headers = new Headers();

        await adapter.listUsers(headers);

        expect(listUsers).toHaveBeenCalledWith({
            query: {
                offset: 0,
                limit: 9,
            },
            headers,
        });
    });

    it("should filter by status using Prisma pagination", async () => {
        const findMany = vi
            .spyOn(prisma.user, "findMany")
            .mockResolvedValue([]);

        const count = vi
            .spyOn(prisma.user, "count")
            .mockResolvedValue(3);

        const adapter = new UserAdapter();

        const result = await adapter.listUsers(
            new Headers(),
            undefined,
            9,
            9,
            "SUSPENDED",
        );

        expect(findMany).toHaveBeenCalledWith({
            where: {
                status: "SUSPENDED",
            },
            skip: 9,
            take: 9,
            orderBy: {
                createdAt: "desc",
            },
        });

        expect(count).toHaveBeenCalledWith({
            where: {
                status: "SUSPENDED",
            },
        });

        expect(result).toEqual({
            users: [],
            total: 3,
            limit: 9,
            offset: 9,
        });
    });
});