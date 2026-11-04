import { UserRole } from "@/features/users/user";
import { ImageNumberSchema } from "@/features/images/image.schema";
import { LocationIdSchema } from "@/features/locations/location.schema";
import { locationService } from "@/container";
import { errorResponse, successResponse } from "@/shared/lib/api-response";
import { requireAuth } from "@/features/auth/server/auth-check";
import { roleCheck } from "@/shared/lib/role-check";
import { parseSchema } from "@/shared/lib/validation";

interface RouteContext {
  params: Promise<{
    id: string;
    imageNumber: string;
  }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    roleCheck(await requireAuth(), [UserRole.ADMIN]);

    const params = await context.params;
    const id = parseSchema(LocationIdSchema, params.id);
    const imageNumber = parseSchema(ImageNumberSchema, params.imageNumber);

    const updated = await locationService.deleteLocationImage(
      id,
      imageNumber,
    );

    return successResponse(updated, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
