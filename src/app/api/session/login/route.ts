import { LoginSchema } from "@/features/auth/auth.schema";
import { authService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { readJson } from "@/shared/lib/json";
import { parseSchema } from "@/shared/lib/validation";

export const POST = secureRoute({ access: "public", rateLimit: "auth" }, async (request) => {
    const input = parseSchema(LoginSchema, await readJson(request));
    const authHeaders = await authService.signIn(request.headers, input);
    const response = successResponse(null);
    for (const cookie of authHeaders.getSetCookie()) {
      response.headers.append("set-cookie", cookie);
    }
    return response;
});
