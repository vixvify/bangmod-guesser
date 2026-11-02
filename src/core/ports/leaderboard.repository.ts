import type {
  LeaderboardUserRecord,
  ProfileUserRecord,
} from "../../../prisma/types/leaderboard";

export interface ProfileDateFilter {
  from?: Date;
  toExclusive?: Date;
  page: number;
  pageSize: number;
}

export interface ProfileRecordsResult {
  user: ProfileUserRecord | null;
  totalGames: number;
}

export interface LeaderboardRepository {
  findLeaderboardUsers(): Promise<LeaderboardUserRecord[]>;
  findProfile(
    userId: string,
    filter: ProfileDateFilter,
  ): Promise<ProfileRecordsResult>;
}