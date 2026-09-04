import type { User } from "../domain/user";
import type { CreateUserInput } from "../schema/auth.schema";

export interface AuthRepository {
  create(data: CreateUserInput): Promise<User>;
  findByEmail(email: string): Promise<(User & { password: string }) | null>;
  findById(id: string): Promise<User | null>;
}
