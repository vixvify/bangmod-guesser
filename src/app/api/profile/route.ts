import { AppError } from "@/shared/errors/app.error";
import { ProfileQuerySchema, UpdateUsernameFormSchema } from "@/features/profile/profile.schema";
import { authService, profileService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { parseSchema } from "@/shared/lib/validation";

export const PATCH = secureRoute({ access: "authenticated", rateLimit: "mutation" }, async (request) => {
    const input = parseSchema(UpdateUsernameFormSchema, await request.json());
    const authHeaders = await authService.updateUsername(request.headers, input);
    const response = successResponse({ username: input.username });
    for (const cookie of authHeaders.getSetCookie()) {
      response.headers.append("set-cookie", cookie);
    }
    return response;
});

export const GET = secureRoute({ access: "authenticated", rateLimit: "read" }, async (request, _context, currentUser) => {
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
});
