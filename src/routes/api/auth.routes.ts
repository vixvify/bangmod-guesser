import { config } from "@/config";

export const AuthRoutes = {
  register: `${config.apiUrl}/auth/sign-up/email`,
  login: `${config.apiUrl}/auth/sign-in/email`,
  logout: `${config.apiUrl}/auth/sign-out`,
  session: `${config.apiUrl}/auth/get-session`,
} as const;

