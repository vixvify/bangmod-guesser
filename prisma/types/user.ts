import type { Role, User as PrismaUser } from "@prisma/client";

export interface UserModel extends PrismaUser {
  role: Role;
}
