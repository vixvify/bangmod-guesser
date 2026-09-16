import { config } from "@/config";

export const AuthRoutes = {
  register: `${config.apiUrl}/auth/register`,
  login: `${config.apiUrl}/auth/login`,
  logout: `${config.apiUrl}/auth/logout`,
} as const;
