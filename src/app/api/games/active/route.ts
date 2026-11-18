import { gameService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";

export const GET = secureRoute({ access: "authenticated", rateLimit: "read" }, async (_request, _context, user) => {
  const active = await gameService.findActiveGame(user.id);
  const response = successResponse({ activeGameId: active?.id ?? null });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
});
