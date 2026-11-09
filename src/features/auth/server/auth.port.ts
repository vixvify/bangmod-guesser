import type { 
  CreateUserInput, 
  LoginInput,
  RequestPasswordResetInput,
  ResetPasswordInput
} from "@/features/auth/auth.schema";
import type { UpdateUsernameFormInput } from "@/features/profile/profile.schema";

export interface AuthPort {
  signIn(headers: Headers, input: LoginInput): Promise<Headers>;
  signUp(headers: Headers, input: CreateUserInput): Promise<void>;
  googleSignIn(headers: Headers, callbackURL: string, errorCallbackURL: string): Promise<{ url: string | undefined; headers: Headers }>;
  signOut(headers: Headers): Promise<Headers>;
  updateUsername(headers: Headers, input: UpdateUsernameFormInput): Promise<Headers>;
  requestPasswordReset(headers: Headers, input: RequestPasswordResetInput, redirectTo: string):Promise<void>;
  resetPassword(headers: Headers, token: string, input: ResetPasswordInput): Promise<void>;
}
