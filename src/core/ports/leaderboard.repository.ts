import type { LeaderboardEntry } from "@/core/domain/leaderboard";
import type { ProfileUserRecord } from "../../../prisma/types/leaderboard";

export interface LeaderboardRecordsResult {
  entries: LeaderboardEntry[];
  myRank: LeaderboardEntry | null;
}

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
  findLeaderboard(userId: string): Promise<LeaderboardRecordsResult>;

  findProfile(
    userId: string,
    filter: ProfileDateFilter,
  ): Promise<ProfileRecordsResult>;
}
