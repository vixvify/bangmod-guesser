import type { CreateUserInput } from "../schema/auth.schema";
import type { UserModel } from "../../../prisma/types/user";

export interface AuthRepository {
  create(data: CreateUserInput): Promise<UserModel>;
  findByEmail(email: string): Promise<UserModel | null>;
  findById(id: string): Promise<UserModel | null>;
}
