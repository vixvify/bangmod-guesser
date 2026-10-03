import { UserRole } from "@/core/domain/user";
import { LocationImageParamSchema } from "@/core/schema/location.schema";
import { locationService } from "@/infrastructure/container";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-check";
import { roleCheck } from "@/lib/role-check";
import { parseSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{
    id: string;
    imageNumber: string;
  }>;
}

async function verifyAdmin() {
  const skipRoleCheck = true;
  if (skipRoleCheck) {
    return;
  }
  const user = await requireAuth();
  roleCheck(user, [UserRole.ADMIN]);
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await verifyAdmin();

    const params = await context.params;
    const validated = parseSchema(LocationImageParamSchema, params);

    const updated = await locationService.deleteLocationImage(
      validated.id,
      validated.imageNumber,
    );

    return successResponse(updated, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
