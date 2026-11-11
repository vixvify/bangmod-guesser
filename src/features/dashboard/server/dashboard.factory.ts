import { GameStatus, RoundStatus } from "@prisma/client";
import { GAME_ROUND_COUNT } from "@/features/game/game.constants";
import { calculateTimeBonus } from "@/shared/lib/game-scoring";
import type {
  DashboardGameCounts,
  DashboardGameLog,
} from "@/features/dashboard/dashboard";
import {
  dashboardDistance,
  roundDashboardNumber,
} from "@/features/dashboard/server/dashboard-metrics";
import type {
  DashboardGameRecord,
  DashboardScoreCount,
  DashboardStatusCount,
} from "../../../../prisma/types/dashboard";

export const DashboardFactory = {
  toGameCounts(records: DashboardStatusCount[]): DashboardGameCounts {
    return {
      total: records.reduce((sum, record) => sum + record._count._all, 0),
      incomplete:
        records.find((record) => record.status === GameStatus.INCOMPLETE)
          ?._count._all ?? 0,
    };
  },

  toScoreFrequencies(
    records: DashboardScoreCount[],
  ): { score: number | null; count: number }[] {
    return records.map((record) => ({
      score: record.totalScore,
      count: record._count._all,
    }));
  },

  toGame(record: DashboardGameRecord): DashboardGameLog {
    return {
      id: record.id,
      status: record.status,
      user: { id: record.user.id, name: record.user.name },
      startedAt: record.startedAt.toISOString(),
      finishedAt: record.finishedAt?.toISOString() ?? null,
      totalScore: record.totalScore,
      roundScoreTotal: record.rounds.reduce(
        (sum, round) =>
          sum + (round.status === RoundStatus.COMPLETED ? round.score : 0),
        0,
      ),
      bonusScore:
        record.status === GameStatus.COMPLETED &&
        record.rounds.length === GAME_ROUND_COUNT &&
        record.rounds.every((round) => round.status === RoundStatus.COMPLETED && round.playTimeSeconds !== null)
          ? calculateTimeBonus(record.rounds.reduce((sum, round) => sum + (round.playTimeSeconds ?? 0), 0))
          : null,
      rounds: record.rounds.map((round) => {
        const completed = round.status === RoundStatus.COMPLETED;
        const distance = completed ? dashboardDistance(round) : null;
        return {
          questionNumber: round.questionNumber,
          status: round.status,
          location: { id: round.location.id, name: round.location.name },
          score: completed ? round.score : null,
          distanceMeters:
            distance === null ? null : roundDashboardNumber(distance),
          playTimeSeconds: round.playTimeSeconds,
        };
      }),
    };
  },
};
