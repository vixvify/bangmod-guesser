export interface GameHistoryItem {
  id: string;
  status: string;
  totalScore: number;
  playedAt: string;
  bestDistanceMeters?: number;
  bestRoundScore?: number;
}

