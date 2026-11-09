import type { AuthPort } from "@/features/auth/server/auth.port";
import type { CreateUserInput, LoginInput } from "@/features/auth/auth.schema";
import { getAuthRedirect } from "@/features/auth/auth-redirect";
import { handleAuthError } from "./auth-error";
import { AppError } from "@/shared/errors/app.error";

export class AuthService {
  constructor(private readonly authAdapter: AuthPort) {}

  async signIn(headers: Headers, input: LoginInput): Promise<Headers> {
    try {
      return await this.authAdapter.signIn(headers, input);
    } catch (error) {
      return handleAuthError(error, "Sign in failed");
    }
  }

  async signUp(headers: Headers, input: CreateUserInput): Promise<void> {
    try {
      await this.authAdapter.signUp(headers, input);
    } catch (error) {
      handleAuthError(error, "Sign up failed");
    }
  }

  async googleSignIn(headers: Headers, callbackURL: string, errorCallbackURL: string): Promise<{ url: string; headers: Headers }> {
    try {
      const result = await this.authAdapter.googleSignIn(
        headers,
        getAuthRedirect(callbackURL),
        getAuthRedirect(errorCallbackURL),
      );
      if (!result.url) throw new AppError("Google sign in failed", 400);
      return { ...result, url: result.url };
    } catch (error) {
      return handleAuthError(error, "Google sign in failed");
    }
  }

  async signOut(headers: Headers): Promise<Headers> {
    try {
      return await this.authAdapter.signOut(headers);
    } catch (error) {
      return handleAuthError(error, "Sign out failed");
    }
  }
}
