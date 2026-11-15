import { gameService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { CreateGameSchema } from "@/features/game/game.schema";
import { parseJson } from "@/shared/lib/json";
import { parseSchema } from "@/shared/lib/validation";

export const POST = secureRoute({ access: "authenticated", rateLimit: "mutation" }, async (request, _context, user) => {
    const body = await request.text();
    const input = parseSchema(CreateGameSchema, body.trim() ? parseJson(body) : {});
    const game = await gameService.createGame(user.id, input);
    const response = successResponse(game, game.existing ? 200 : 201);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
});
