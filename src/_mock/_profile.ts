export interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  status: string;
  role: string;
  avatar_url?: string;
}

export interface GameHistoryItem {
  game_id: string;
  game_status: string;
  total_score: number;
  created_at: string;
  best_distance_m?: number;
  best_round_score?: number;
}

export const mockUser: UserProfile = {
  user_id: "USR-001",
  username: "Username",
  email: "example@gmail.com",
  status: "ACTIVE",
  role: "USER",
};

export const mockGameHistory: GameHistoryItem[] = [
  {
    game_id: "GAME-0001",
    game_status: "COMPLETED",
    total_score: 4890,
    created_at: "2026-09-28T14:30:00",
    best_distance_m: 1.2,
    best_round_score: 1000,
  },
  {
    game_id: "GAME-0002",
    game_status: "COMPLETED",
    total_score: 4280,
    created_at: "2026-09-27T19:42:00",
    best_distance_m: 4.8,
    best_round_score: 980,
  },
  {
    game_id: "GAME-0003",
    game_status: "COMPLETED",
    total_score: 3850,
    created_at: "2026-09-26T11:20:00",
    best_distance_m: 12.5,
    best_round_score: 910,
  },
  {
    game_id: "GAME-0004",
    game_status: "COMPLETED",
    total_score: 3500,
    created_at: "2026-09-25T10:15:00",
    best_distance_m: 18.2,
    best_round_score: 870,
  },
  {
    game_id: "GAME-0005",
    game_status: "COMPLETED",
    total_score: 2970,
    created_at: "2026-09-22T16:08:00",
    best_distance_m: 35.0,
    best_round_score: 790,
  },
  {
    game_id: "GAME-0006",
    game_status: "COMPLETED",
    total_score: 2250,
    created_at: "2026-09-20T13:45:00",
    best_distance_m: 64.0,
    best_round_score: 650,
  },
  {
    game_id: "GAME-0007",
    game_status: "COMPLETED",
    total_score: 1420,
    created_at: "2026-09-18T09:12:00",
    best_distance_m: 120.5,
    best_round_score: 480,
  },
];
