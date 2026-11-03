import { UserRole } from "@/features/users/domain/user";
import { SearchUserQuerySchema } from "@/features/users/schema/user.schema";
import { userService } from "@/container";
import { errorResponse, successResponse } from "@/shared/lib/api-response";
import { requireAuth } from "@/features/auth/lib/auth-check";
import { roleCheck } from "@/shared/lib/role-check";
import { parseSchema } from "@/shared/lib/validation";

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

        const result = await userService.getUsers(query);

        return successResponse(result);
    } catch (error) {
        return errorResponse(error);
    }
}
