import { AppError } from "@/shared/errors/app.error";
import { LOCATION_MAX_IMAGES } from "@/features/locations/location.constants";
import { IMAGE_MAX_SIZE_BYTES, IMAGE_MESSAGES } from "@/features/images/image.constants";
import { UserRole } from "@/features/users/user";
import { CreateLocationImagesSchema } from "@/features/images/image.schema";
import {
  CreateLocationSchema,
  SearchLocationQuerySchema,
} from "@/features/locations/location.schema";
import { locationService } from "@/container";
import { errorResponse, successResponse } from "@/shared/lib/api-response";
import { requireAuth } from "@/features/auth/server/auth-check";
import { roleCheck } from "@/shared/lib/role-check";
import { parseSchema } from "@/shared/lib/validation";

export async function GET(request: Request) {
  try {
    const query = parseSchema(
      SearchLocationQuerySchema,
      Object.fromEntries(new URL(request.url).searchParams),
    );
    return successResponse(await locationService.getLocations(query));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    roleCheck(await requireAuth(), [UserRole.ADMIN]);
    if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
      throw new AppError("Content-Type must be multipart/form-data", 400);
    }

    const form = await request.formData();
    const files = form.getAll("images");
    if (files.length > LOCATION_MAX_IMAGES) {
      throw new AppError("Maximum 5 images allowed", 400);
    }
    if (files.some((file) => file instanceof File && file.size > IMAGE_MAX_SIZE_BYTES)) {
      throw new AppError(IMAGE_MESSAGES.tooLarge, 400);
    }
    const images = await Promise.all(
      files.map(async (value) =>
        value instanceof File
          ? { contentType: value.type, content: new Uint8Array(await value.arrayBuffer()) }
          : value,
      ),
    );
    const input = parseSchema(CreateLocationSchema, {
      name: form.get("name"),
      description: form.get("description") ?? undefined,
      latitude: form.get("latitude"),
      longitude: form.get("longitude"),
    });
    const validatedImages = parseSchema(CreateLocationImagesSchema, images);

    return successResponse(await locationService.createLocation(input, validatedImages), 201);
  } catch (error) {
    return errorResponse(error);
  }
}
