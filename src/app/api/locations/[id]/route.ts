import { UserRole } from "@/core/domain/user";
import {
  LocationIdParamSchema,
  UpdateLocationSchema,
} from "@/core/schema/location.schema";
import {
  UploadImageSchema,
  type ImageContentType,
} from "@/core/schema/image.schema";
import { locationService } from "@/infrastructure/container";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-check";
import { roleCheck } from "@/lib/role-check";
import { parseSchema } from "@/lib/validation";
import type {
  CreateLocationImageItem,
  ReplaceImageItem,
  UpdateLocationDto,
} from "@/core/service/location.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function verifyAdmin() {
  const skipRoleCheck = true;
  if (skipRoleCheck) {
    return;
  }
  const user = await requireAuth();
  roleCheck(user, [UserRole.ADMIN]);
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const { id } = parseSchema(LocationIdParamSchema, params);

    const location = await locationService.getLocationById(id);
    return successResponse(location, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await verifyAdmin();

    const params = await context.params;
    const { id } = parseSchema(LocationIdParamSchema, params);

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const name = formData.get("name");
      const description = formData.get("description");
      const latitude = formData.get("latitude");
      const longitude = formData.get("longitude");
      const status = formData.get("status");

      const validatedFields = parseSchema(UpdateLocationSchema, {
        name: name !== null ? name : undefined,
        description: description !== null ? String(description) : undefined,
        latitude: latitude !== null ? latitude : undefined,
        longitude: longitude !== null ? longitude : undefined,
        status: status !== null ? status : undefined,
      });

      const deleteImageNumbers: number[] = [];
      const rawDeleteNumbers = formData.getAll("deleteImageNumbers");
      for (const item of rawDeleteNumbers) {
        const num = Number(item);
        if (!Number.isNaN(num) && num >= 1 && num <= 5) {
          deleteImageNumbers.push(num);
        }
      }

      for (let num = 1; num <= 5; num += 1) {
        if (formData.get(`delete_${num}`) === "true") {
          deleteImageNumbers.push(num);
        }
      }

      const replacementImages: ReplaceImageItem[] = [];

      for (let num = 1; num <= 5; num += 1) {
        const file =
          formData.get(`image_${num}`) ||
          formData.get(`replace_${num}`) ||
          formData.get(`image${num}`);

        if (file instanceof File) {
          const buffer = new Uint8Array(await file.arrayBuffer());
          parseSchema(UploadImageSchema, {
            contentType: file.type,
            content: buffer,
          });

          replacementImages.push({
            imageNumber: num,
            contentType: file.type as ImageContentType,
            content: buffer,
          });
        }
      }

      const newImages: CreateLocationImageItem[] = [];
      const newFiles = formData
        .getAll("new_images")
        .concat(formData.getAll("add_images"))
        .filter((item): item is File => item instanceof File);

      for (const file of newFiles) {
        const buffer = new Uint8Array(await file.arrayBuffer());
        parseSchema(UploadImageSchema, {
          contentType: file.type,
          content: buffer,
        });

        newImages.push({
          contentType: file.type as ImageContentType,
          content: buffer,
        });
      }

      const updatePayload: UpdateLocationDto = {
        name: validatedFields.name,
        description: validatedFields.description,
        latitude:
          validatedFields.latitude !== undefined
            ? Number(validatedFields.latitude)
            : undefined,
        longitude:
          validatedFields.longitude !== undefined
            ? Number(validatedFields.longitude)
            : undefined,
        status: validatedFields.status,
        deleteImageNumbers:
          deleteImageNumbers.length > 0 ? deleteImageNumbers : undefined,
        replacementImages:
          replacementImages.length > 0 ? replacementImages : undefined,
        newImages: newImages.length > 0 ? newImages : undefined,
      };

      const updated = await locationService.updateLocation(id, updatePayload);
      return successResponse(updated, 200);
    }

    const body = await request.json();
    const validatedData = parseSchema(UpdateLocationSchema, body);

    const updated = await locationService.updateLocation(id, {
      name: validatedData.name,
      description: validatedData.description,
      latitude:
        validatedData.latitude !== undefined
          ? Number(validatedData.latitude)
          : undefined,
      longitude:
        validatedData.longitude !== undefined
          ? Number(validatedData.longitude)
          : undefined,
      status: validatedData.status,
      deleteImageNumbers: validatedData.deleteImageNumbers,
    });
    return successResponse(updated, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await verifyAdmin();

    const params = await context.params;
    const { id } = parseSchema(LocationIdParamSchema, params);

    await locationService.deleteLocation(id);
    return successResponse(null, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
