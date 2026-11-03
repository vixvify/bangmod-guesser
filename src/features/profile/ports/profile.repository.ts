import type { ProfileHistoryFilter } from "../domain/profile";
import type { GetProfileRecordsResult } from "../../../../prisma/types/profile";

export interface ProfileRepository {
  findProfile(userId: string, filter: ProfileHistoryFilter): Promise<GetProfileRecordsResult>;
}
