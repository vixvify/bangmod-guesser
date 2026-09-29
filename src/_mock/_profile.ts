import type { GameHistoryItem } from "@/core/domain/profile";

export const mockGameHistory: GameHistoryItem[] = [
  {
    id: "GAME-0001",
    status: "COMPLETED",
    totalScore: 4890,
    playedAt: "2026-09-28T14:30:00",
    bestDistanceMeters: 1.2,
    bestRoundScore: 1000,
  },
  {
    id: "GAME-0002",
    status: "COMPLETED",
    totalScore: 4280,
    playedAt: "2026-09-27T19:42:00",
    bestDistanceMeters: 4.8,
    bestRoundScore: 980,
  },
  {
    id: "GAME-0003",
    status: "COMPLETED",
    totalScore: 3850,
    playedAt: "2026-09-26T11:20:00",
    bestDistanceMeters: 12.5,
    bestRoundScore: 910,
  },
  {
    id: "GAME-0004",
    status: "COMPLETED",
    totalScore: 3500,
    playedAt: "2026-09-25T10:15:00",
    bestDistanceMeters: 18.2,
    bestRoundScore: 870,
  },
];
