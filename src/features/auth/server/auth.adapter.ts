import type { AuthPort } from "@/features/auth/server/auth.port";
import type { CreateUserInput, LoginInput } from "@/features/auth/auth.schema";
import { auth } from "@/features/auth/server/auth";
import type { UpdateUsernameFormInput } from "@/features/profile/profile.schema";

export class AuthAdapter implements AuthPort {
  async signIn(requestHeaders: Headers, input: LoginInput): Promise<Headers> {
    const { headers } = await auth.api.signInEmail({
      body: input,
      headers: requestHeaders,
      returnHeaders: true,
    });
    return headers;
  }

  async signUp(headers: Headers, input: CreateUserInput): Promise<void> {
    await auth.api.signUpEmail({ body: input, headers });
  }

  async googleSignIn(requestHeaders: Headers, callbackURL: string, errorCallbackURL: string): Promise<{ url: string | undefined; headers: Headers }> {
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

  async updateUsername(headers: Headers, input: UpdateUsernameFormInput): Promise<Headers> {
    try {
      const result = await auth.api.updateUser({
        body: { name: input.username },
        headers,
        returnHeaders: true,
      });
      return result.headers;
    } catch (error) {
      return authFailure(error, "Update username failed");
    }
  }
}
