import { config } from "@/shared/config/runtime";

export const ProfileRoutes = {
  history: `${config.apiUrl}/profile`,
  update: `${config.apiUrl}/profile`,
} as const;
