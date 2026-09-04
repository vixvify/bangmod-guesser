import { AuthRepository } from "../ports/auth.repository";
import { parseSchema } from "@/lib/validation";
import {
  RegisterInput,
  RegisterSchema,
  LoginInput,
  LoginSchema,
} from "../schema/auth.schema";
import { User } from "../domain/user";

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}
  async register(user: RegisterInput): Promise<User> {
    try {
      const validated = parseSchema(RegisterSchema, user);

      const response = await this.authRepository.register(validated);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  async login(user: LoginInput): Promise<User> {
    try {
      const validated = parseSchema(LoginSchema, user);
      const response = await this.authRepository.login(validated);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  async logout(): Promise<void> {
    try {
      const response = await this.authRepository.logout();
      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      throw error;
    }
  }
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.authRepository.getCurrentUser();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    } catch {
      return null;
    }
  }
}
