import { headers } from "next/headers";

import { UserRole } from "@/core/domain/user";
import { UserFormSchema, UserIdSchema } from "@/core/schema/user.schema";
import { userService } from "@/infrastructure/container";
import { requireAuth } from "@/lib/auth-check";
import { roleCheck } from "@/lib/role-check";
import { errorResponse, successResponse } from "@/lib/api-response";
import { parseSchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireAuth();

    roleCheck(currentUser, [UserRole.ADMIN]);

    const { id } = await context.params;
    const userId = parseSchema(UserIdSchema, id);
    const body = await request.json();
    const data = parseSchema(UserFormSchema, body);
    const requestHeaders = await headers();

    const updatedUser = await userService.updateUser(
      requestHeaders,
      userId,
      data,
    );

    return successResponse(updatedUser);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireAuth();

    roleCheck(currentUser, [UserRole.ADMIN]);

    const { id } = await context.params;
    const userId = parseSchema(UserIdSchema, id);
    const requestHeaders = await headers();

    await userService.deleteUser(requestHeaders, userId);

    return successResponse({
      success: true,
      userId,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
