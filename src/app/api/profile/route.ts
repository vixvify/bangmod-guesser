import { AppError } from "@/core/errors/app.error";
import { leaderboardService } from "@/infrastructure/container";
import { requireAuth } from "@/lib/auth-check";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    const url = new URL(request.url);

    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;
    const rawPage = url.searchParams.get("page");

    let page: number | undefined;

    if (rawPage !== null) {
      page = Number(rawPage);

      if (!Number.isInteger(page) || page < 1) {
        throw new AppError("Page must be a positive integer", 400);
      }
    }

    const result = await leaderboardService.getProfile(
      currentUser.id,
      { from, to, page },
    );

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}