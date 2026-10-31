import "server-only";
import type { DashboardGameLogs, DashboardSummary } from "@/core/domain/dashboard";
import type { DashboardQueryInput } from "@/core/schema/dashboard.schema";
import { dashboardService } from "@/infrastructure/container";

export async function getDashboard(query: DashboardQueryInput, now = new Date()): Promise<DashboardSummary> {
  const [overview, games] = await Promise.all([
    dashboardService.getOverview(query, now),
    dashboardService.getGames(query, now),
  ]);
  return { ...overview, games };
}

export async function getDashboardGames(query: DashboardQueryInput, now = new Date()): Promise<DashboardGameLogs> {
  return dashboardService.getGames(query, now);
}
