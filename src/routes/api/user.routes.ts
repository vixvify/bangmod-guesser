import { config } from "@/lib/config";

export const UserRoutes = {
  list: `${config.apiUrl}/users`,
  update: (id: string) => `${config.apiUrl}/users/${id}`,
  delete: (id: string) => `${config.apiUrl}/users/${id}`,
} as const;
