import type {
  GetUserRecordsResult,
  UserModelWithGameCount,
} from "../../../../prisma/types/user";
import type { SearchUserQuery } from "@/features/users/user.schema";

export interface UserRepository {
  findMany(query: SearchUserQuery): Promise<GetUserRecordsResult>;
  findById(id: string): Promise<UserModelWithGameCount | null>;
}
