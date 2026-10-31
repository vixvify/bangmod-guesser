export const dashboardNow = new Date("2026-10-27T05:00:00Z");
export const dashboardLocation = { id: "location-1", name: "Library", latitude: 13.6516, longitude: 100.4952 };
export const dashboardRound = {
  gameId: "game-1", questionNumber: 1, status: "COMPLETED" as const, score: 1000,
  playTimeSeconds: 12, guessedLatitude: dashboardLocation.latitude, guessedLongitude: dashboardLocation.longitude,
  location: dashboardLocation,
};
export const dashboardGame = {
  id: "game-1", user: { id: "user-1", name: "Player" }, status: "COMPLETED" as const,
  startedAt: new Date("2026-10-27T04:00:00Z"), finishedAt: new Date("2026-10-27T04:05:00Z"),
  totalScore: 1300, rounds: [dashboardRound],
};
import type { DashboardSummary } from "@/core/domain/dashboard";

export const dashboardSummary: DashboardSummary = {
  period: { startDate: "2026-10-01", endDate: "2026-10-30", previousStartDate: "2026-09-01", previousEndDate: "2026-09-30", timeZone: "Asia/Bangkok" },
  generatedAt: "2026-10-30T05:00:00.000Z",
  totalGames: { count: 12, previousCount: 10, changePercent: 20 },
  players: { date: "2026-10-30", previousDate: "2026-10-29", timeZone: "Asia/Bangkok", count: 3, previousCount: 2, changePercent: 50, playing: 1 },
  roundAverage: { score: 800, maxScore: 1000, percentage: 80, count: 20, distanceMeters: 100, distanceCount: 20 },
  dropOff: { count: 1, ratePercent: 8.33, baseline: { scope: "ALL_TIME", gameCount: 100, incompleteCount: 10, ratePercent: 10 }, comparison: "below", differencePercentagePoints: -1.67, mostCommonRound: 2, unknownRoundCount: 0, byRound: [{ questionNumber: 2, count: 1 }] },
  dailyGames: [{ date: "2026-10-29", count: 4 }, { date: "2026-10-30", count: 8 }],
  scores: { maxScore: 5000, count: 1, median: 3500, mean: 3500, highAccuracy: { threshold: 4000, operator: "gt", count: 0, percentage: 0 }, buckets: [{ min: 3000, max: 4000, maxInclusive: false, count: 1, percentage: 100 }], mostFrequentBucket: { min: 3000, max: 4000, maxInclusive: false, count: 1, percentage: 100 } },
  games: { total: 1, page: 1, pageSize: 5, totalPages: 1, items: [{ id: "game-1", user: { id: "user-1", name: "Player" }, status: "COMPLETED", startedAt: "2026-10-30T04:00:00.000Z", finishedAt: "2026-10-30T04:05:00.000Z", totalScore: 3500, roundScoreTotal: 3000, bonusScore: null, rounds: [{ questionNumber: 1, status: "COMPLETED", location: { id: "loc-1", name: "หอสมุด" }, score: 800, distanceMeters: 50, playTimeSeconds: 42 }] }] },
};
