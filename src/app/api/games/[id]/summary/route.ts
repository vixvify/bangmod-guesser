import { gameService } from "@/container";
import { GameIdSchema } from "@/features/game/game.schema";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { parseSchema } from "@/shared/lib/validation";

export const GET = secureRoute<{ params: Promise<{ id: string }> }>({ access: "authenticated", rateLimit: "read" }, async (_request, context, user) => {
    const id = parseSchema(GameIdSchema, (await context.params).id);
    const response = successResponse(await gameService.summary(id, user.id));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
});
