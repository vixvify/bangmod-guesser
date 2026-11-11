import { DashboardQuerySchema } from "@/features/dashboard/dashboard.schema";
import { dashboardService } from "@/container";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { parseSchema } from "@/shared/lib/validation";

export const GET = secureRoute({ access: "admin", rateLimit: "admin" }, async (request) => {
    const query = parseSchema(DashboardQuerySchema, Object.fromEntries(new URL(request.url).searchParams));
    const response = successResponse(await dashboardService.getDashboard(query));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
});
