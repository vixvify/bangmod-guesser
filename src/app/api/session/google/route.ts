import { GoogleSignInSchema } from "@/features/auth/auth.schema";
import { authService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { readJson } from "@/shared/lib/json";
import { parseSchema } from "@/shared/lib/validation";

export const POST = secureRoute({ access: "public", rateLimit: "auth" }, async (request) => {
    const { callbackURL, errorCallbackURL } = parseSchema(GoogleSignInSchema, await readJson(request));
    const { url, headers } = await authService.googleSignIn(request.headers, callbackURL, errorCallbackURL);
    const response = successResponse({ url });
    for (const cookie of headers.getSetCookie()) {
      response.headers.append("set-cookie", cookie);
    }
    return response;
});
