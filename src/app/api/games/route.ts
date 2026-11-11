import { gameService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";

export const POST = secureRoute({ access: "authenticated", rateLimit: "mutation" }, async (_request, _context, user) => {
    const response = successResponse(await gameService.createGame(user.id), 201);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
});
