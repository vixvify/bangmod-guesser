import { config } from "@/shared/config/runtime";

export const GameRoutes = {
  create: `${config.apiUrl}/games`,
  currentRound: (id: string) => `${config.apiUrl}/games/${encodeURIComponent(id)}/current-round`,
  guess: (id: string, questionNumber: number) => `${config.apiUrl}/games/${encodeURIComponent(id)}/rounds/${questionNumber}/guess`,
  summary: (id: string) => `${config.apiUrl}/games/${encodeURIComponent(id)}/summary`,
  exit: (id: string) => `${config.apiUrl}/games/${encodeURIComponent(id)}/exit`,
} as const;
