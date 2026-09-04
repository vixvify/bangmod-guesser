import { ApiResponse } from "../interface/response";
import httpClient from "@/lib/http";
import { AuthRepository } from "@/core/ports/auth.repository";
import { User } from "@/core/domain/user";
import { RegisterInput, LoginInput } from "@/core/schema/auth.schema";
import { AuthRoutes } from "../routes/auth.routes";

export class AuthRepositoryImpl implements AuthRepository {
  async register(user: RegisterInput): Promise<ApiResponse<User>> {
    const response = await httpClient.post<User>(AuthRoutes.register, user);
    return response;
  }
  async login(user: LoginInput): Promise<ApiResponse<User>> {
    const response = await httpClient.post<User>(AuthRoutes.login, user);
    return response;
  }
  async logout(): Promise<ApiResponse<void>> {
    const response = await httpClient.post<void>(AuthRoutes.logout);
    return response;
  }
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await httpClient.get<User>(AuthRoutes.getCurrentUser);
    return response;
  }
}
