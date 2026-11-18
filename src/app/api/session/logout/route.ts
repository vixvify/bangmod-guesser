import { authService, gameService } from "@/container";
import { authCheck } from "@/features/auth/server/auth-check";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";

export const POST = secureRoute({ access: "public", rateLimit: "auth" }, async (request) => {
    const user = await authCheck();
    if (user) {
      try {
        await gameService.exitActiveGame(user.id);
      } catch {
      }
    }
    const authHeaders = await authService.signOut(request.headers);
    const response = successResponse(null);
    for (const cookie of authHeaders.getSetCookie()) {
      response.headers.append("set-cookie", cookie);
    }
    return response;
});
