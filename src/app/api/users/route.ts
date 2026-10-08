import { UserRole } from "@/core/domain/user";
import { SearchUserQuerySchema } from "@/core/schema/user.schema";
import { UserAdapter } from "@/infrastructure/adapters/user.adapter";
import { UserService } from "@/core/service/user.service";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-check";
import { roleCheck } from "@/lib/role-check";
import { parseSchema } from "@/lib/validation";
import { headers } from "next/headers";

export async function GET(request: Request) {
    try {
        roleCheck(
            await requireAuth(),
            [UserRole.ADMIN],
        );

        const query = parseSchema(
            SearchUserQuerySchema,
            Object.fromEntries(new URL(request.url).searchParams),
        );

        const requestHeaders = await headers();

        const userService =
            new UserService(
                new UserAdapter(),
            );

        const result =
            await userService.getUsers(
                requestHeaders,
                query.page,
                query.limit,
                query.role,
                query.status,
            );

        return successResponse(result);
    } catch (error) {
        return errorResponse(error);
    }
}