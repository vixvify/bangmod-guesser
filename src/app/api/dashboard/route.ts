import { UserRole } from "@/features/users/domain/user";
import { DashboardQuerySchema } from "@/features/dashboard/schema/dashboard.schema";
import { dashboardService } from "@/container";
import { errorResponse, successResponse } from "@/shared/lib/api-response";
import { requireAuth } from "@/features/auth/lib/auth-check";
import { roleCheck } from "@/shared/lib/role-check";
import { parseSchema } from "@/shared/lib/validation";

export async function GET(request: Request) {
  try {
    roleCheck(await requireAuth(), [UserRole.ADMIN]);
    const query = parseSchema(DashboardQuerySchema, Object.fromEntries(new URL(request.url).searchParams));
    const response = successResponse(await dashboardService.getDashboard(query));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
