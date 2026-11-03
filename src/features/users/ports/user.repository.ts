import type { GetUserRecordsResult, UserModelWithGameCount } from "../../../../prisma/types/user";
import type { SearchUserQuery } from "@/features/users/schema/user.schema";
import type { UserStatus } from "@/features/users/domain/user";

export interface UserRepository {
  findMany(query: SearchUserQuery): Promise<GetUserRecordsResult>;
  findById(id: string): Promise<UserModelWithGameCount | null>;
  updateStatus(id: string, status: UserStatus): Promise<void>;
}
