import { UserRole } from "@/core/domain/user";
import { SearchUserQuerySchema } from "@/core/schema/user.schema";
import { userService } from "@/infrastructure/container";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-check";
import { roleCheck } from "@/lib/role-check";
import { parseSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    roleCheck(await requireAuth(), [UserRole.ADMIN]);

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
