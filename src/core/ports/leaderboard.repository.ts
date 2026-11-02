export interface LeaderboardGameRecord {
  totalScore: number | null;
}

export interface LeaderboardUserRecord {
  id: string;
  name: string;
  games: LeaderboardGameRecord[];
}

export interface ProfileRoundRecord {
  questionNumber: number;
  guessedLatitude: number | null;
  guessedLongitude: number | null;
  score: number;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface ProfileGameRecord {
  id: string;
  status: string;
  startedAt: Date;
  totalScore: number | null;
  rounds: ProfileRoundRecord[];
}

export interface ProfileUserRecord {
  id: string;
  name: string;
  email: string;
  games: ProfileGameRecord[];
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
  findLeaderboardUsers(): Promise<LeaderboardUserRecord[]>;
  findProfile(
    userId: string,
    filter: ProfileDateFilter,
  ): Promise<ProfileRecordsResult>;
}