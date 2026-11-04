import type { GetUserRecordsResult, UserModelWithGameCount } from "../../../../prisma/types/user";
import type { SearchUserQuery } from "@/features/users/user.schema";
import type { UserStatus } from "@/features/users/user";

export interface UserRepository {
  findMany(query: SearchUserQuery): Promise<GetUserRecordsResult>;
  findById(id: string): Promise<UserModelWithGameCount | null>;
  updateStatus(id: string, status: UserStatus): Promise<void>;
}
