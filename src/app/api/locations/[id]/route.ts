import { UserRole } from "@/core/domain/user";
import { UpdateLocationImagesSchema } from "@/core/schema/image.schema";
import { LOCATION_MAX_IMAGES } from "@/core/constants/location";
import { IMAGE_MAX_SIZE_BYTES, IMAGE_MESSAGES } from "@/core/constants/image";
import { AppError } from "@/core/errors/app.error";
import { LocationIdSchema, UpdateLocationSchema } from "@/core/schema/location.schema";
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
    const id = parseSchema(LocationIdSchema, (await context.params).id);
    return successResponse(await locationService.getLocationById(id));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    roleCheck(await requireAuth(), [UserRole.ADMIN]);
    const id = parseSchema(LocationIdSchema, (await context.params).id);

    if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
      const body = await request.json();
      const input = parseSchema(UpdateLocationSchema, body);
      const images = parseSchema(UpdateLocationImagesSchema, body);
      return successResponse(await locationService.updateLocation(id, input, images));
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
    const body = {
      name: form.get("name") ?? undefined,
      description: form.get("description") ?? undefined,
      latitude: form.get("latitude") ?? undefined,
      longitude: form.get("longitude") ?? undefined,
      status: form.get("status") ?? undefined,
      keepImageNumbers: form.has("keepImageNumbers")
        ? form.getAll("keepImageNumbers").filter((value) => value !== "")
        : undefined,
      newImages,
    };
    const input = parseSchema(UpdateLocationSchema, body);
    const images = parseSchema(UpdateLocationImagesSchema, body);

    return successResponse(await locationService.updateLocation(id, input, images));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    roleCheck(await requireAuth(), [UserRole.ADMIN]);
    const id = parseSchema(LocationIdSchema, (await context.params).id);
    await locationService.deleteLocation(id);
    return successResponse(null);
  } catch (error) {
    return errorResponse(error);
  }
}
