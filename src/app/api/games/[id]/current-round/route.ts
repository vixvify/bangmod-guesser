import { gameService } from "@/container";
import { requireAuth } from "@/features/auth/server/auth-check";
import { GameIdSchema } from "@/features/game/game.schema";
import { errorResponse, successResponse } from "@/shared/lib/api-response";
import { parseSchema } from "@/shared/lib/validation";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const id = parseSchema(GameIdSchema, (await context.params).id);
    const response = successResponse(await gameService.currentRound(id, user.id));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
