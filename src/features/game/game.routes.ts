import { config } from "@/shared/config/runtime";

export const GameRoutes = {
  create: `${config.apiUrl}/games`,
  currentRound: (id: string) => `${config.apiUrl}/games/${encodeURIComponent(id)}/current-round`,
  exit: (id: string) => `${config.apiUrl}/games/${encodeURIComponent(id)}/exit`,
} as const;
