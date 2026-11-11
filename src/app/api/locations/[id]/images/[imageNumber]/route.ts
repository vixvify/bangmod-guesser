import { ImageNumberSchema } from "@/features/images/image.schema";
import { LocationIdSchema } from "@/features/locations/location.schema";
import { locationService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { parseSchema } from "@/shared/lib/validation";

interface RouteContext {
  params: Promise<{
    id: string;
    imageNumber: string;
  }>;
}

export const DELETE = secureRoute<RouteContext>({ access: "admin", rateLimit: "admin" }, async (_request, context) => {

    const params = await context.params;
    const id = parseSchema(LocationIdSchema, params.id);
    const imageNumber = parseSchema(ImageNumberSchema, params.imageNumber);

    const updated = await locationService.deleteLocationImage(
      id,
      imageNumber,
    );

    return successResponse(updated, 200);
});
