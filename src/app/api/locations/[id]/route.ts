import { UpdateLocationImagesSchema } from "@/features/images/image.schema";
import { LOCATION_MAX_IMAGES } from "@/features/locations/location.constants";
import { IMAGE_MAX_SIZE_BYTES, IMAGE_MESSAGES } from "@/features/images/image.constants";
import { AppError } from "@/shared/errors/app.error";
import { LocationIdSchema, UpdateLocationSchema } from "@/features/locations/location.schema";
import { locationService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { parseJson, readJson } from "@/shared/lib/json";
import { parseSchema } from "@/shared/lib/validation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = secureRoute<RouteContext>({ access: "admin", rateLimit: "admin" }, async (_request, context) => {
    const id = parseSchema(LocationIdSchema, (await context.params).id);
    const response = successResponse(await locationService.getLocationById(id));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
});

export const PUT = secureRoute<RouteContext>({ access: "admin", rateLimit: "admin" }, async (request, context) => {
    const id = parseSchema(LocationIdSchema, (await context.params).id);

    if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
      const body = await readJson(request);
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
      expectedImages: form.has("expectedImages")
        ? parseJson(String(form.get("expectedImages")))
        : undefined,
    };
    const input = parseSchema(UpdateLocationSchema, body);
    const images = parseSchema(UpdateLocationImagesSchema, body);

    return successResponse(await locationService.updateLocation(id, input, images));
});

export const DELETE = secureRoute<RouteContext>({ access: "admin", rateLimit: "admin" }, async (_request, context) => {
    const id = parseSchema(LocationIdSchema, (await context.params).id);
    await locationService.deleteLocation(id);
    return successResponse(null);
});
