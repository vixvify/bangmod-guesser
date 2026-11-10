import { gameService } from "@/container";
import { requireAuth } from "@/features/auth/server/auth-check";
import { GameIdSchema, QuestionNumberSchema } from "@/features/game/game.schema";
import { errorResponse, successResponse } from "@/shared/lib/api-response";
import { parseSchema } from "@/shared/lib/validation";

export async function GET(_request: Request, context: { params: Promise<{ id: string; questionNumber: string }> }) {
  try {
    const user = await requireAuth();
    const params = await context.params;
    const id = parseSchema(GameIdSchema, params.id);
    const questionNumber = parseSchema(QuestionNumberSchema, params.questionNumber);
    const response = successResponse(await gameService.roundResult(id, user.id, questionNumber));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
