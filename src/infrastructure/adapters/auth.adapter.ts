import { APIError } from "better-auth/api";
import { AppError } from "@/core/errors/app.error";
import type { AuthPort } from "@/core/ports/auth.port";
import type { CreateUserInput, LoginInput } from "@/core/schema/auth.schema";
import { auth } from "@/lib/auth";

function authFailure(error: unknown, message: string): never {
  if (error instanceof APIError) {
    throw new AppError(message, error.statusCode);
  }
  throw error;
}

export class AuthAdapter implements AuthPort {
  async signIn(requestHeaders: Headers, input: LoginInput): Promise<Headers> {
    try {
      const { headers } = await auth.api.signInEmail({
        body: input,
        headers: requestHeaders,
        returnHeaders: true,
      });
      return headers;
    } catch (error) {
      return authFailure(error, "Sign in failed");
    }
  }

  async signUp(headers: Headers, input: CreateUserInput): Promise<void> {
    try {
      await auth.api.signUpEmail({ body: input, headers });
    } catch (error) {
      authFailure(error, "Sign up failed");
    }
  }

  async googleSignIn(requestHeaders: Headers, callbackURL: string, errorCallbackURL: string): Promise<{ url: string; headers: Headers }> {
    try {
      const { response, headers } = await auth.api.signInSocial({
        body: { provider: "google", callbackURL, errorCallbackURL },
        headers: requestHeaders,
        returnHeaders: true,
      });
      if (!response.url) throw new AppError("Google sign in failed", 400);
      return { url: response.url, headers };
    } catch (error) {
      return authFailure(error, "Google sign in failed");
    }
  }

  async signOut(headers: Headers): Promise<Headers> {
    try {
      const result = await auth.api.signOut({ headers, returnHeaders: true });
      return result.headers;
    } catch (error) {
      return authFailure(error, "Sign out failed");
    }
  }
}
