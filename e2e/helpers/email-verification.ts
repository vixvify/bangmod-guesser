import { createEmailVerificationToken } from "better-auth/api";
import { E2E_AUTH_SECRET, E2E_BASE_URL } from "../config";

export async function emailVerificationUrl(email: string): Promise<string> {
  const url = new URL("/api/auth/verify-email", E2E_BASE_URL);
  const token = await createEmailVerificationToken(E2E_AUTH_SECRET, email);
  url.searchParams.set("token", token);
  url.searchParams.set("callbackURL", "/login?verification=email");
  return url.toString();
}
