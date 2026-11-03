import { UserRole } from "@/core/domain/user";
import { DashboardQuerySchema } from "@/core/schema/dashboard.schema";
import { dashboardService } from "@/infrastructure/container";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-check";
import { roleCheck } from "@/lib/role-check";
import { parseSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    roleCheck(await requireAuth(), [UserRole.ADMIN]);
    const query = parseSchema(DashboardQuerySchema, Object.fromEntries(new URL(request.url).searchParams));
    const response = successResponse(await dashboardService.getGames(query));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
