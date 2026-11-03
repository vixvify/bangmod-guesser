import { config } from "@/shared/config/runtime";

export const ProfileRoutes = {
  history: `${config.apiUrl}/profile`,
} as const;
