import { config } from "@/lib/config";

export const DashboardRoutes = {
  summary: `${config.apiUrl}/dashboard`,
  games: `${config.apiUrl}/dashboard/games`,
} as const;
