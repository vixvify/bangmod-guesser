import { leaderboardService } from "@/container";
import { requireAuth } from "@/features/auth/server/auth-check";
import { errorResponse, successResponse } from "@/shared/lib/api-response";

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