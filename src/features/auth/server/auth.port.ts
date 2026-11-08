import type { CreateUserInput, LoginInput } from "@/features/auth/auth.schema";
import type { UpdateUsernameFormInput } from "@/features/profile/profile.schema";

export interface AuthPort {
  signIn(headers: Headers, input: LoginInput): Promise<Headers>;
  signUp(headers: Headers, input: CreateUserInput): Promise<void>;
  googleSignIn(headers: Headers, callbackURL: string, errorCallbackURL: string): Promise<{ url: string; headers: Headers }>;
  signOut(headers: Headers): Promise<Headers>;
  updateUsername(headers: Headers, input: UpdateUsernameFormInput): Promise<Headers>;
}
