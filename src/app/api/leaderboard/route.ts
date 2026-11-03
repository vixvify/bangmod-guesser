import { leaderboardService } from "@/infrastructure/container";
import { requireAuth } from "@/lib/auth-check";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const currentUser = await requireAuth();

    const result = await leaderboardService.getLeaderboard(
      currentUser.id,
    );

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}