import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { UserAdapter } from "@/infrastructure/adapters/user.adapter";
import { UserService } from "@/core/service/user.service";
import { requireAuth } from "@/lib/auth-check";
import { roleCheck } from "@/lib/role-check";
import { AppError } from "@/core/errors/app.error";
import {
    UserRole,
    type UserStatus,
} from "@/core/domain/user";

export async function GET(request: Request) {
    try {
        const currentUser = await requireAuth();

        roleCheck(
            currentUser,
            [UserRole.ADMIN],
        );

        const requestHeaders = await headers();

        const { searchParams } =
            new URL(request.url);

        const page = Number(
            searchParams.get("page") ?? "1",
        );

        const limit = Number(
            searchParams.get("limit") ?? "9",
        );

        const roleParam =
            searchParams.get("role");

        let role: UserRole | undefined;

        if (roleParam) {
            if (
                roleParam !== UserRole.USER &&
                roleParam !== UserRole.ADMIN
            ) {
                return NextResponse.json(
                    {
                        message:
                            "Invalid role",
                    },
                    {
                        status: 400,
                    },
                );
            }

            role = roleParam;
        }

        const statusParam =
            searchParams.get("status");

        let status: UserStatus | undefined;

        if (statusParam) {
            if (
                statusParam !== "ACTIVE" &&
                statusParam !== "SUSPENDED" &&
                statusParam !== "INACTIVE"
            ) {
                return NextResponse.json(
                    {
                        message:
                            "Invalid status",
                    },
                    {
                        status: 400,
                    },
                );
            }

            status = statusParam;
        }

        if (
            !Number.isInteger(page) ||
            page < 1 ||
            !Number.isInteger(limit) ||
            limit < 1
        ) {
            return NextResponse.json(
                {
                    message:
                        "Invalid pagination parameters",
                },
                {
                    status: 400,
                },
            );
        }

        const userService =
            new UserService(
                new UserAdapter(),
            );

        const result =
            await userService.getUsers(
                requestHeaders,
                page,
                limit,
                role,
                status,
            );

        return NextResponse.json(result);
    } catch (error) {
        console.error(
            "GET /api/users error:",
            error,
        );

        if (error instanceof AppError) {
            return NextResponse.json(
                {
                    message: error.message,
                },
                {
                    status: error.status,
                },
            );
        }

        return NextResponse.json(
            {
                message:
                    "Failed to get users",
            },
            {
                status: 500,
            },
        );
    }
}