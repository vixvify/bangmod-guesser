import { GameIdSchema } from "@/features/game/game.schema";
import { gameService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { parseSchema } from "@/shared/lib/validation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const POST = secureRoute<RouteContext>({ access: "authenticated", rateLimit: "mutation" }, async (_request, context, user) => {
    const id = parseSchema(GameIdSchema, (await context.params).id);
    const response = successResponse(await gameService.exitGame(id, user.id));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
});
