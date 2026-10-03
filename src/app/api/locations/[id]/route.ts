import { UserRole } from "@/core/domain/user";
import { LOCATION_MAX_IMAGES } from "@/core/constants/location";
import { IMAGE_MAX_SIZE_BYTES, IMAGE_MESSAGES } from "@/core/constants/image";
import { AppError } from "@/core/errors/app.error";
import {
  LocationIdParamSchema,
  UpdateLocationSchema,
} from "@/core/schema/location.schema";
import { locationService } from "@/infrastructure/container";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-check";
import { roleCheck } from "@/lib/role-check";
import { parseSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = parseSchema(LocationIdParamSchema, await context.params);
    return successResponse(await locationService.getLocationById(id));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    roleCheck(await requireAuth(), [UserRole.ADMIN]);
    const { id } = parseSchema(LocationIdParamSchema, await context.params);

    if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
      const input = parseSchema(UpdateLocationSchema, await request.json());
      return successResponse(await locationService.updateLocation(id, input));
    }

    const form = await request.formData();
    const files = form.getAll("newImages");
    if (files.length > LOCATION_MAX_IMAGES) {
      throw new AppError("Maximum 5 images allowed", 400);
    }
    if (files.some((file) => file instanceof File && file.size > IMAGE_MAX_SIZE_BYTES)) {
      throw new AppError(IMAGE_MESSAGES.tooLarge, 400);
    }
    const newImages = await Promise.all(
      files.map(async (value) =>
        value instanceof File
          ? { contentType: value.type, content: new Uint8Array(await value.arrayBuffer()) }
          : value,
      ),
    );
    const input = parseSchema(UpdateLocationSchema, {
      name: form.get("name") ?? undefined,
      description: form.get("description") ?? undefined,
      latitude: form.get("latitude") ?? undefined,
      longitude: form.get("longitude") ?? undefined,
      status: form.get("status") ?? undefined,
      keepImageNumbers: form.has("keepImageNumbers")
        ? form.getAll("keepImageNumbers").filter((value) => value !== "")
        : undefined,
      newImages,
    });

    return successResponse(await locationService.updateLocation(id, input));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    roleCheck(await requireAuth(), [UserRole.ADMIN]);
    const { id } = parseSchema(LocationIdParamSchema, await context.params);
    await locationService.deleteLocation(id);
    return successResponse(null);
  } catch (error) {
    return errorResponse(error);
  }
}
