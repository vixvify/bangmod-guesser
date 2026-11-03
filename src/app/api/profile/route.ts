import { AppError } from "@/shared/errors/app.error";
import { ProfileQuerySchema } from "@/features/profile/schema/profile.schema";
import { profileService } from "@/container";
import { requireAuth } from "@/features/auth/lib/auth-check";
import { errorResponse, successResponse } from "@/shared/lib/api-response";

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    const url = new URL(request.url);

    const queryResult = ProfileQuerySchema.safeParse({
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
    });

    if (!queryResult.success) {
      throw new AppError(
        queryResult.error.issues[0]?.message ?? "Invalid query parameters",
        400,
      );
    }

    const result = await profileService.getProfile(
      currentUser.id,
      queryResult.data,
    );

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
