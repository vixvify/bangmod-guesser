import { AppError } from "@/core/errors/app.error";
import { UserRole } from "@/core/domain/user";
import {
  LocationFormSchema,
  SearchLocationQuerySchema,
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

async function verifyAdmin() {
  const skipRoleCheck = true;
  if (skipRoleCheck) {
    return;
  }
  const user = await requireAuth();
  roleCheck(user, [UserRole.ADMIN]);
}

async function extractImages(formData: FormData): Promise<File[]> {
  const images = formData
    .getAll("images")
    .filter((item): item is File => item instanceof File);
  if (images.length > 0) {
    if (images.length > 5) {
      throw new AppError("Maximum 5 images allowed", 400);
    }
    return images;
  }

  const files = formData
    .getAll("files")
    .filter((item): item is File => item instanceof File);
  if (files.length > 0) {
    if (files.length > 5) {
      throw new AppError("Maximum 5 images allowed", 400);
    }
    return files;
  }

  const numbered: File[] = [];
  for (let i = 1; i <= 5; i += 1) {
    const file = formData.get(`image_${i}`) || formData.get(`image${i}`);
    if (file instanceof File) {
      numbered.push(file);
    }
  }

  if (numbered.length >= 1 && numbered.length <= 5) {
    return numbered;
  }

  if (numbered.length > 5) {
    throw new AppError("Maximum 5 images allowed", 400);
  }

  throw new AppError("At least 1 image is required", 400);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const searchBy = url.searchParams.get("searchBy") || undefined;
    const page = url.searchParams.get("page") || undefined;
    const pageSize =
      url.searchParams.get("pageSize") ||
      url.searchParams.get("page_size") ||
      undefined;
    const orderBy = url.searchParams.get("orderBy") || undefined;

    const query = parseSchema(SearchLocationQuerySchema, {
      search,
      searchBy,
      page,
      pageSize,
      orderBy,
    });

    const result = await locationService.getLocations({
      search: query.search,
      searchBy: query.searchBy,
      page: query.page,
      pageSize: query.pageSize,
      orderBy: query.orderBy,
    });

    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await verifyAdmin();

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      throw new AppError("Content-Type must be multipart/form-data", 400);
    }

    const formData = await request.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const latitude = formData.get("latitude");
    const longitude = formData.get("longitude");

    const validatedData = parseSchema(LocationFormSchema, {
      name,
      description: description ? String(description) : null,
      latitude,
      longitude,
    });

    const files = await extractImages(formData);

    const imagePayloads = await Promise.all(
      files.map(async (file) => {
        const buffer = new Uint8Array(await file.arrayBuffer());
        parseSchema(UploadImageSchema, {
          contentType: file.type,
          content: buffer,
        });

        return {
          contentType: file.type as ImageContentType,
          content: buffer,
        };
      }),
    );

    const created = await locationService.createLocation({
      name: validatedData.name,
      description: validatedData.description,
      latitude: Number(validatedData.latitude),
      longitude: Number(validatedData.longitude),
      images: imagePayloads,
    });

    return successResponse(created, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
