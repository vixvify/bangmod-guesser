import { GameIdSchema } from "@/core/schema/game.schema";
import { gameService } from "@/infrastructure/container";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-check";
import { parseSchema } from "@/lib/validation";

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
