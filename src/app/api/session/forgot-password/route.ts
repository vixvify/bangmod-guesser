import { RequestPasswordResetSchema } from "@/features/auth/auth.schema";
import { authService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { readJson } from "@/shared/lib/json";
import { parseSchema } from "@/shared/lib/validation";

export const POST = secureRoute({ access: "public", rateLimit: "auth" }, async (request) => {
    const input = parseSchema(
      RequestPasswordResetSchema,
      await readJson(request)
    );
    await authService.requestPasswordReset(request.headers, input);
    return successResponse(null);
});
