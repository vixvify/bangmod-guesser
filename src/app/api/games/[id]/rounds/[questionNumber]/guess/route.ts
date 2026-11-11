import { gameService } from "@/container";
import { GameIdSchema, GuessSchema, QuestionNumberSchema } from "@/features/game/game.schema";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { readJson } from "@/shared/lib/json";
import { parseSchema } from "@/shared/lib/validation";

export const POST = secureRoute<{ params: Promise<{ id: string; questionNumber: string }> }>({ access: "authenticated", rateLimit: "mutation" }, async (request, context, user) => {
    const params = await context.params;
    const id = parseSchema(GameIdSchema, params.id);
    const questionNumber = parseSchema(QuestionNumberSchema, params.questionNumber);
    const input = parseSchema(GuessSchema, await readJson(request));
    const response = successResponse(await gameService.submitGuess(id, user.id, questionNumber, input));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
});
