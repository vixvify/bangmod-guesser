import { ApiResponse } from "@/infrastructure/interface/response";
import { RegisterInput, LoginInput } from "../schema/auth.schema";
import { User } from "../domain/user";

export interface AuthRepository {
  register(user: RegisterInput): Promise<ApiResponse<User>>;
  login(user: LoginInput): Promise<ApiResponse<User>>;
  logout(): Promise<ApiResponse<void>>;
  getCurrentUser(): Promise<ApiResponse<User>>;
}
