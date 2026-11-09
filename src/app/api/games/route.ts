import { gameService } from "@/container";
import { requireAuth } from "@/features/auth/server/auth-check";
import { errorResponse, successResponse } from "@/shared/lib/api-response";

export async function POST() {
  try {
    const user = await requireAuth();
    const response = successResponse(await gameService.createGame(user.id), 201);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
