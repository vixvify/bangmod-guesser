import {
    UserRole,
    type UserStatus,
} from "@/core/domain/user";
import { UserAdapter } from "@/infrastructure/adapters/user.adapter";
import { AppError } from "@/core/errors/app.error";

export class UserService {
    constructor(
        private readonly userAdapter: UserAdapter,
    ) {}

    async getUsers(
        headers: Headers,
        page: number = 1,
        limit: number = 9,
        role?: UserRole,
        status?: UserStatus,
    ) {
        const result =
            await this.userAdapter.listUsers(
                headers,
                role,
            );

        const userIds =
            result.users.map(
                (user) => user.id,
            );

        const metadata =
            await this.userAdapter.getUserMetadata(
                userIds,
            );

        const metadataMap = new Map(
            metadata.map((item) => [
                item.id,
                {
                    gameCount: item._count.games,
                    status: item.status,
                },
            ]),
        );

        const users = result.users.map(
            (user) => {
                const userMetadata =
                    metadataMap.get(user.id);

                const userStatus: UserStatus =
                    userMetadata?.status ??
                    "ACTIVE";

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image:
                        user.image ?? null,
                    role:
                        user.role as UserRole,
                    status: userStatus,
                    gameCount:
                        userMetadata?.gameCount ??
                        0,
                    suspension: {
                        startDate: null,
                        endDate:
                            userStatus ===
                                "SUSPENDED" &&
                            user.banExpires
                                ? new Date(
                                    user.banExpires,
                                ).toISOString()
                                : null,
                    },
                    reason:
                        user.banReason ?? "",
                };
            },
        );

        const filteredUsers =
            status
                ? users.filter(
                    (user) =>
                        user.status ===
                        status,
                )
                : users;

                
        const total =
            filteredUsers.length;

        const offset =
            (page - 1) * limit;

        const paginatedUsers =
            filteredUsers.slice(
                offset,
                offset + limit,
            );

        return {
            users: paginatedUsers,
            total,
            page,
            limit,
        };
    }

    async getUser(
        headers: Headers,
        userId: string,
    ) {
        return this.userAdapter.getUser(
            headers,
            userId,
        );
    }

    async updateUser(
        headers: Headers,
        userId: string,
        data: {
            name: string;
            role: UserRole;
            status: UserStatus;
            suspension: {
                endDate: string | null;
            };
            reason: string;
        },
    ) {
        await this.updateName(
            headers,
            userId,
            data.name,
        );

        await this.updateRole(
            headers,
            userId,
            data.role,
        );

        await this.updateStatus(
            headers,
            userId,
            data.status,
            data.reason,
            data.suspension.endDate
                ? new Date(
                    data.suspension.endDate,
                )
                : undefined,
        );

        return {
            success: true,
            userId,
        };
    }

    async updateName(
        headers: Headers,
        userId: string,
        name: string,
    ) {
        return this.userAdapter.updateUser(
            headers,
            userId,
            { name },
        );
    }

    async updateRole(
        headers: Headers,
        userId: string,
        role: UserRole,
    ) {
        return this.userAdapter.setRole(
            headers,
            userId,
            role,
        );
    }

    async deleteUser(
        headers: Headers,
        userId: string,
    ) {
        return this.userAdapter.removeUser(
            headers,
            userId,
        );
    }

    async updateStatus(
        headers: Headers,
        userId: string,
        status: UserStatus,
        reason?: string,
        endDate?: Date,
    ) {
        
        if (status === "SUSPENDED") {
            if (endDate) {
                const now = new Date();

                const seconds = Math.floor(
                    (
                        endDate.getTime() -
                        now.getTime()
                    ) / 1000,
                );

                if (seconds <= 0) {
                    throw new AppError(
                        "End date must be in the future",
                        400,
                    );
                }

                await this.userAdapter.banUser(
                    headers,
                    userId,
                    reason,
                    seconds,
                );
            } else {
                await this.userAdapter.banUser(
                    headers,
                    userId,
                    reason,
                );
            }

            return this.userAdapter.updateStatus(
                userId,
                "SUSPENDED",
            );
        }

        if (status === "ACTIVE") {
            await this.userAdapter.unbanUser(
                headers,
                userId,
            );

            return this.userAdapter.updateStatus(
                userId,
                "ACTIVE",
            );
        }

        if (status === "INACTIVE") {
            await this.userAdapter.unbanUser(
                headers,
                userId,
            );

            return this.userAdapter.updateStatus(
                userId,
                "INACTIVE",
            );
        }

        throw new Error(
            `Unsupported user status: ${status}`,
        );
    }
}