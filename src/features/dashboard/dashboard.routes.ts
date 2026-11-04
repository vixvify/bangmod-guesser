import { config } from "@/shared/config/runtime";

export const DashboardRoutes = {
  summary: `${config.apiUrl}/dashboard`,
  games: `${config.apiUrl}/dashboard/games`,
} as const;
