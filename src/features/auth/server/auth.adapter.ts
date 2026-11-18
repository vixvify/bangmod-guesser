import type { AuthPort } from "@/features/auth/server/auth.port";
import type {
  CreateUserInput,
  LoginInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
} from "@/features/auth/auth.schema";
import { auth } from "@/features/auth/server/auth";
import type { UpdateUsernameFormInput } from "@/features/profile/profile.schema";
import { APIError } from "better-auth/api";
import { AppError } from "@/shared/errors/app.error";
import { prisma } from "@/shared/lib/prisma";

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
      if (
        error instanceof APIError &&
        error.body?.code === "BANNED_USER"
      ) {
        let banExpires: Date | null = null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: input.email },
            select: { banExpires: true },
          });

          banExpires = user?.banExpires ?? null;
        } catch {
        }

        throw new AppError(
          "Sign in failed",
          error.statusCode,
          "BANNED_USER",
          {
            banExpires: banExpires?.toISOString() ?? null,
          },
        );
      }

      throw error;
    }
  }

  async signUp(headers: Headers, input: CreateUserInput): Promise<void> {
    await auth.api.signUpEmail({ body: input, headers });
  }

  async googleSignIn(
    requestHeaders: Headers,
    callbackURL: string,
    errorCallbackURL: string,
  ): Promise<{ url: string | undefined; headers: Headers }> {
    const { response, headers } = await auth.api.signInSocial({
      body: { provider: "google", callbackURL, errorCallbackURL },
      headers: requestHeaders,
      returnHeaders: true,
    });
    return { url: response.url ?? undefined, headers };
  }

  async signOut(headers: Headers): Promise<Headers> {
    const result = await auth.api.signOut({ headers, returnHeaders: true });
    return result.headers;
  }

  async updateUsername(
    headers: Headers,
    input: UpdateUsernameFormInput,
  ): Promise<Headers> {
    const result = await auth.api.updateUser({
      body: { name: input.username },
      headers,
      returnHeaders: true,
    });
    return result.headers;
  }

  async requestPasswordReset(
    headers: Headers,
    input: RequestPasswordResetInput,
    redirectTo: string,
  ): Promise<void> {
    await auth.api.requestPasswordReset({
      body: { email: input.email, redirectTo },
      headers,
    });
  }

  async resetPassword(
    headers: Headers,
    token: string,
    input: ResetPasswordInput,
  ): Promise<void> {
    await auth.api.resetPassword({
      body: { newPassword: input.password, token },
      headers,
    });
  }
}
