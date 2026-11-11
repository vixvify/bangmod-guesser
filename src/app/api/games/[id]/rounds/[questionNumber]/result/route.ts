import { gameService } from "@/container";
import { GameIdSchema, QuestionNumberSchema } from "@/features/game/game.schema";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { parseSchema } from "@/shared/lib/validation";

export const GET = secureRoute<{ params: Promise<{ id: string; questionNumber: string }> }>({ access: "authenticated", rateLimit: "read" }, async (_request, context, user) => {
    const params = await context.params;
    const id = parseSchema(GameIdSchema, params.id);
    const questionNumber = parseSchema(QuestionNumberSchema, params.questionNumber);
    const response = successResponse(await gameService.roundResult(id, user.id, questionNumber));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
});
