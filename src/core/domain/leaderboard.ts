export interface LeaderboardEntry {
  rank: number;
  name: string;
  gamesPlayed: number;
  totalScore: number;
}

export interface LeaderboardResult {
  entries: LeaderboardEntry[];
  myRank: LeaderboardEntry | null;
}
