export type LeaderboardQueryRecord = {
  userId: string;
  rank: number;
  name: string;
  image: string | null;
  gamesPlayed: number;
  totalScore: number;
};
