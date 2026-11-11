import { leaderboardService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";

export const GET = secureRoute({ access: "authenticated", rateLimit: "read" }, async (_request, _context, currentUser) => {

    const result = await leaderboardService.getLeaderboard(
      currentUser.id,
    );

    return successResponse(result);
});
