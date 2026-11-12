export interface LeaderboardEntry {
  rank: number;
  name: string;
  image: string | null;
  gamesPlayed: number;
  totalScore: number;
}

export interface LeaderboardResult {
  entries: LeaderboardEntry[];
  myRank: LeaderboardEntry | null;
}
