import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { UserAdapter } from "@/infrastructure/adapters/user.adapter";
import { UserService } from "@/core/service/user.service";
import { requireAuth } from "@/lib/auth-check";
import { roleCheck } from "@/lib/role-check";
import { UserRole } from "@/core/domain/user";
import { UserFormSchema } from "@/core/schema/user.schema";
import { AppError } from "@/core/errors/app.error";

const userService = new UserService(
    new UserAdapter(),
);

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(
    request: Request,
    context: RouteContext,
) {
    try {
        const currentUser = await requireAuth();

        roleCheck(
            currentUser,
            [UserRole.ADMIN],
        );

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                {
                    message:
                        "User ID is required",
                },
                {
                    status: 400,
                },
            );
        }

        const body = await request.json();

        const result =
            UserFormSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    message:
                        "Invalid user data",
                    errors:
                        result.error.flatten(),
                },
                {
                    status: 400,
                },
            );
        }

        const requestHeaders =
            await headers();

        const updatedUser =
            await userService.updateUser(
                requestHeaders,
                id,
                result.data,
            );

        return NextResponse.json(
            updatedUser,
        );
    } catch (error) {
        console.error(
            "PATCH /api/users/[id] error:",
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
                    "Failed to update user",
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE(
    request: Request,
    context: RouteContext,
) {
    try {
        const currentUser =
            await requireAuth();

        roleCheck(
            currentUser,
            [UserRole.ADMIN],
        );

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                {
                    message:
                        "User ID is required",
                },
                {
                    status: 400,
                },
            );
        }

        const requestHeaders =
            await headers();

        await userService.deleteUser(
            requestHeaders,
            id,
        );

        return NextResponse.json({
            success: true,
            userId: id,
        });
    } catch (error) {
        console.error(
            "DELETE /api/users/[id] error:",
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
                    "Failed to delete user",
            },
            {
                status: 500,
            },
        );
    }
}