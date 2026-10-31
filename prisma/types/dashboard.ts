import type { GameRound, Location, Prisma } from "@prisma/client";

export const dashboardGameSelect = {
  id: true, status: true, startedAt: true, finishedAt: true, totalScore: true,
  user: { select: { id: true, name: true } },
  rounds: {
    orderBy: { questionNumber: "asc" },
    select: {
      questionNumber: true, status: true, score: true, playTimeSeconds: true,
      guessedLatitude: true, guessedLongitude: true,
      location: { select: { id: true, name: true, latitude: true, longitude: true } },
    },
  },
} satisfies Prisma.GameSelect;

export type DashboardGameRecord = Prisma.GameGetPayload<{ select: typeof dashboardGameSelect }>;
export type DashboardGameRecords = { items: DashboardGameRecord[]; total: number };
export type DashboardStatusCount = Pick<Prisma.GameGroupByOutputType, "status"> & { _count: { _all: number } };
export type DashboardScoreCount = { totalScore: number | null; _count: { _all: number } };
export type DashboardRoundAverage = { _avg: { score: number | null }; _count: { _all: number } };
export type DashboardRoundCursor = Pick<GameRound, "gameId" | "questionNumber">;
export type DashboardDistanceRecord = Pick<GameRound, "gameId" | "questionNumber" | "guessedLatitude" | "guessedLongitude"> & {
  location: Pick<Location, "latitude" | "longitude">;
};
export type DashboardIncompleteRecord = { id: string; rounds: { questionNumber: number }[] };
export type DashboardDailyCount = { date: string; count: number };
