import { ResetPasswordRequestSchema } from "@/features/auth/auth.schema";
import { authService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { readJson } from "@/shared/lib/json";
import { parseSchema } from "@/shared/lib/validation";

export const POST = secureRoute({ access: "public", rateLimit: "auth" }, async (request) => {
    const { token, password, confirmPassword } = parseSchema(
      ResetPasswordRequestSchema,
      await readJson(request),
    );
    await authService.resetPassword(request.headers, token, { password, confirmPassword });
    return successResponse(null);
});
