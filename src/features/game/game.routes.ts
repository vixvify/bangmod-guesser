import { config } from "@/shared/config/runtime";

export const GameRoutes = {
  create: `${config.apiUrl}/games`,
  active: `${config.apiUrl}/games/active`,
  currentRound: (id: string) => `${config.apiUrl}/games/${encodeURIComponent(id)}/current-round`,
  encryptedRoundImage: (id: string, questionNumber: number) => `${config.apiUrl}/games/${encodeURIComponent(id)}/rounds/${questionNumber}/encrypted-image`,
  guess: (id: string, questionNumber: number) => `${config.apiUrl}/games/${encodeURIComponent(id)}/rounds/${questionNumber}/guess`,
  roundResult: (id: string, questionNumber: number) => `${config.apiUrl}/games/${encodeURIComponent(id)}/rounds/${questionNumber}/result`,
  summary: (id: string) => `${config.apiUrl}/games/${encodeURIComponent(id)}/summary`,
  exit: (id: string) => `${config.apiUrl}/games/${encodeURIComponent(id)}/exit`,
  terminate: (id: string) => `${config.apiUrl}/games/${encodeURIComponent(id)}/terminate`,
} as const;
