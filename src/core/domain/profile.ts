export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface GameHistoryItem {
  id: string;
  status: string;
  totalScore: number;
  playedAt: string;
  bestDistanceMeters?: number;
  bestRoundScore?: number;
}

