import { authService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";

export const POST = secureRoute({ access: "public", rateLimit: "auth" }, async (request) => {
    const authHeaders = await authService.signOut(request.headers);
    const response = successResponse(null);
    for (const cookie of authHeaders.getSetCookie()) {
      response.headers.append("set-cookie", cookie);
    }
    return response;
});
