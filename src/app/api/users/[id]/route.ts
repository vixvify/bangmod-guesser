import { headers } from "next/headers";

import { UserRole } from "@/features/users/user";
import { UserFormSchema, UserIdSchema } from "@/features/users/user.schema";
import { userService } from "@/container";
import { requireAuth } from "@/features/auth/server/auth-check";
import { roleCheck } from "@/shared/lib/role-check";
import { errorResponse, successResponse } from "@/shared/lib/api-response";
import { readJson } from "@/shared/lib/json";
import { parseSchema } from "@/shared/lib/validation";

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
        const currentUser =
            await requireAuth();

        roleCheck(
            currentUser,
            [UserRole.ADMIN],
        );

        const { id } = await context.params;

        const userId = parseSchema(
            UserIdSchema,
            id,
        );

        const body = await readJson(request);

        const data = parseSchema(
            UserFormSchema,
            body,
        );

        const requestHeaders =
            await headers();

        const updatedUser =
            await userService.updateUser(
                requestHeaders,
                userId,
                data,
            );

        return successResponse(
            updatedUser,
        );
    } catch (error) {
        return errorResponse(error);
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

        const userId = parseSchema(
            UserIdSchema,
            id,
        );

        const requestHeaders =
            await headers();

        await userService.deleteUser(
            requestHeaders,
            userId,
        );

        return successResponse({
            success: true,
            userId,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
