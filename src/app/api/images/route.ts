import { IMAGE_MESSAGES } from "@/core/constants/image";
import { UserRole } from "@/core/domain/user";
import { AppError } from "@/core/errors/app.error";
import {
  DeleteImageSchema,
  UploadImageSchema,
} from "@/core/schema/image.schema";
import { imageService } from "@/infrastructure/container";
import { errorResponse, successResponse } from "@/lib/api-response";
import { authCheck } from "@/lib/auth-check";
import { roleCheck } from "@/lib/role-check";
import { parseSchema } from "@/lib/validation";

async function requireAdmin() {
  return roleCheck(await authCheck(), [UserRole.ADMIN]);
}

async function getImageFile(request: Request): Promise<File> {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    throw new AppError(IMAGE_MESSAGES.fileRequired, 400);
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new AppError(IMAGE_MESSAGES.fileRequired, 400);
  }

  return file;
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const file = await getImageFile(request);

    const image = await imageService.upload(
      parseSchema(UploadImageSchema, {
        contentType: file.type,
        content: new Uint8Array(await file.arrayBuffer()),
      }),
    );

    return successResponse(image, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    await imageService.delete(
      parseSchema(DeleteImageSchema, await request.json()),
    );

    return successResponse(null);
  } catch (error) {
    return errorResponse(error);
  }
}
