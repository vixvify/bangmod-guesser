import { config } from "@/lib/config";

export const GameRoutes = {
  exit: (id: string) => `${config.apiUrl}/games/${encodeURIComponent(id)}/exit`,
} as const;
