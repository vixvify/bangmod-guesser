import type { GetUserRecordsResult, UserModelWithGameCount } from "../../../prisma/types/user";
import type { SearchUserQuery } from "@/core/schema/user.schema";
import type { UserStatus } from "@/core/domain/user";

export interface UserRepository {
  findMany(query: SearchUserQuery): Promise<GetUserRecordsResult>;
  findById(id: string): Promise<UserModelWithGameCount | null>;
  updateStatus(id: string, status: UserStatus): Promise<void>;
}
