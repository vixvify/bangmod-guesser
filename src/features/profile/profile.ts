export interface GameHistoryItem {
  id: string;
  status: string;
  totalScore: number | null;
  grade: "SSS" | "S" | "A" | "B" | "C" | "D" | null;
  playedAt: string;
  bestDistanceMeters?: number;
  bestRoundScore?: number;
  bestRoundNumber?: number;
}

export interface ProfileResult {
  id: string;
  name: string;
  email: string;
  games: GameHistoryItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalGames: number;
    totalPages: number;
  };
}

export interface ProfileHistoryFilter {
  from?: Date;
  toExclusive?: Date;
  page: number;
  pageSize: number;
}
