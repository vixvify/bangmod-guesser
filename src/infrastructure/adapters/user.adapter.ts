import {
    UserRole,
    type UserStatus,
} from "@/core/domain/user";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export class UserAdapter {
    async listUsers(
        headers: Headers,
        role?: UserRole,
    ) {
        return auth.api.listUsers({
            query: {
                ...(role
                    ? {
                        filterField: "role",
                        filterOperator: "eq",
                        filterValue: role,
                    }
                    : {}),
            },
            headers,
        });
    }

    async getUser(
        headers: Headers,
        userId: string,
    ) {
        return auth.api.getUser({
            query: {
                id: userId,
            },
            headers,
        });
    }

    async updateUser(
        headers: Headers,
        userId: string,
        data: {
            name: string;
        },
    ) {
        return auth.api.adminUpdateUser({
            body: {
                userId,
                data,
            },
            headers,
        });
    }

    async setRole(
        headers: Headers,
        userId: string,
        role: UserRole,
    ) {
        return auth.api.setRole({
            body: {
                userId,
                role,
            },
            headers,
        });
    }

    async banUser(
        headers: Headers,
        userId: string,
        banReason?: string,
        banExpiresIn?: number,
    ) {
        return auth.api.banUser({
            body: {
                userId,
                banReason,
                banExpiresIn,
            },
            headers,
        });
    }

    async unbanUser(
        headers: Headers,
        userId: string,
    ) {
        return auth.api.unbanUser({
            body: {
                userId,
            },
            headers,
        });
    }

    async removeUser(
        headers: Headers,
        userId: string,
    ) {
        return auth.api.removeUser({
            body: {
                userId,
            },
            headers,
        });
    }

    async updateStatus(
        userId: string,
        status: UserStatus,
    ) {
        return prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                status,
            },
        });
    }

    async getUserMetadata(
        userIds: string[],
    ) {
        return prisma.user.findMany({
            where: {
                id: {
                    in: userIds,
                },
            },
            select: {
                id: true,
                status: true,
                _count: {
                    select: {
                        games: true,
                    },
                },
            },
        });
    }
}