import type { AuthPort } from "@/features/auth/ports/auth.port";
import type { CreateUserInput, LoginInput } from "@/features/auth/schema/auth.schema";
import { getAuthRedirect } from "@/features/auth/lib/auth-redirect";

export class AuthService {
  constructor(private readonly authAdapter: AuthPort) {}

  signIn(headers: Headers, input: LoginInput): Promise<Headers> {
    return this.authAdapter.signIn(headers, input);
  }

  signUp(headers: Headers, input: CreateUserInput): Promise<void> {
    return this.authAdapter.signUp(headers, input);
  }

  googleSignIn(headers: Headers, callbackURL: string, errorCallbackURL: string): Promise<{ url: string; headers: Headers }> {
    return this.authAdapter.googleSignIn(
      headers,
      getAuthRedirect(callbackURL),
      getAuthRedirect(errorCallbackURL),
    );
  }

  signOut(headers: Headers): Promise<Headers> {
    return this.authAdapter.signOut(headers);
  }
}
