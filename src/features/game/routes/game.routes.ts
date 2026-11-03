import { config } from "@/shared/config/runtime";

export const GameRoutes = {
  exit: (id: string) => `${config.apiUrl}/games/${encodeURIComponent(id)}/exit`,
} as const;
