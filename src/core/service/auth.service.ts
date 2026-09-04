import type { User } from "../domain/user";
import type { AuthRepository } from "../ports/auth.repository";
import {
  LoginSchema,
  RegisterSchema,
  type LoginInput,
  type RegisterInput,
} from "../schema/auth.schema";
import { parseSchema } from "@/lib/validation";
import { AppError } from "@/core/errors/app.error";
import { hashPassword, verifyPassword } from "@/lib/password";

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(input: RegisterInput): Promise<User> {
    const user = parseSchema(RegisterSchema, input);
    const existingUser = await this.authRepository.findByEmail(user.email);

    if (existingUser) {
      throw new AppError("Email is already registered", 409);
    }

    return this.authRepository.create({
      name: user.name,
      email: user.email,
      password: await hashPassword(user.password),
    });
  }

  async login(input: LoginInput): Promise<User> {
    const credentials = parseSchema(LoginSchema, input);
    const user = await this.authRepository.findByEmail(credentials.email);

    if (!user || !(await verifyPassword(credentials.password, user.password))) {
      throw new AppError("Invalid email or password", 401);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  async getCurrentUser(userId: string | null): Promise<User | null> {
    if (!userId) {
      return null;
    }

    return this.authRepository.findById(userId);
  }
}
