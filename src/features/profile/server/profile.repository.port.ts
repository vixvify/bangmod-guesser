import type { ProfileHistoryFilter } from "../profile";
import type { GetProfileRecordsResult } from "../../../../prisma/types/profile";

export interface ProfileRepository {
  findProfile(userId: string, filter: ProfileHistoryFilter): Promise<GetProfileRecordsResult>;
}
