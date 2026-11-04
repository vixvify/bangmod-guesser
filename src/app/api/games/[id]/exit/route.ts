import { GameIdSchema } from "@/features/game/game.schema";
import { gameService } from "@/container";
import { errorResponse, successResponse } from "@/shared/lib/api-response";
import { requireAuth } from "@/features/auth/server/auth-check";
import { parseSchema } from "@/shared/lib/validation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const id = parseSchema(GameIdSchema, (await context.params).id);
    const response = successResponse(await gameService.exitGame(id, user.id));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
