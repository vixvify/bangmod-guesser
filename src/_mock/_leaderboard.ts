import type { LeaderboardEntry } from "@/core/domain/leaderboard";

export const leaderboardEntries: LeaderboardEntry[] = [
  { rank: 1, name: "phobrak", gamesPlayed: 67, totalScore: 244553 },
  { rank: 2, name: "auntonin", gamesPlayed: 56, totalScore: 196541 },
  { rank: 3, name: "mind_mint", gamesPlayed: 49, totalScore: 171939 },
  { rank: 4, name: "kraprao", gamesPlayed: 42, totalScore: 143549 },
  { rank: 5, name: "mmie", gamesPlayed: 38, totalScore: 129952 },
  { rank: 6, name: "vixvify_v", gamesPlayed: 29, totalScore: 100842 },
  { rank: 7, name: "f0rgus", gamesPlayed: 32, totalScore: 99186 },
  { rank: 8, name: "helihanthwan", gamesPlayed: 26, totalScore: 87510 },
  { rank: 9, name: "pondod", gamesPlayed: 21, totalScore: 79324 },
  { rank: 10, name: "phurit", gamesPlayed: 19, totalScore: 72680 },
];

export const currentPlayerRank: LeaderboardEntry = {
  rank: 127,
  name: "winter",
  gamesPlayed: 7,
  totalScore: 23940,
};
