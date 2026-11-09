import { AppError } from "@/shared/errors/app.error";
import { ProfileQuerySchema, UpdateUsernameFormSchema } from "@/features/profile/profile.schema";
import { authService, profileService } from "@/container";
import { requireAuth } from "@/features/auth/server/auth-check";
import { errorResponse, successResponse } from "@/shared/lib/api-response";
import { parseSchema } from "@/shared/lib/validation";

export async function PATCH(request: Request) {
  try {
    await requireAuth();
    const input = parseSchema(UpdateUsernameFormSchema, await request.json());
    const authHeaders = await authService.updateUsername(request.headers, input);
    const response = successResponse({ username: input.username });
    for (const cookie of authHeaders.getSetCookie()) {
      response.headers.append("set-cookie", cookie);
    }
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}

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
