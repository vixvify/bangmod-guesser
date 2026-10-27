import { GameStatus, Prisma, RoundStatus } from "@prisma/client";
import { DASHBOARD_MAX_SCORE, DASHBOARD_QUERY_BATCH_SIZE, DASHBOARD_TIME_ZONE } from "@/core/constants/dashboard";
import type { DashboardDateRange } from "@/core/domain/dashboard";
import type { DashboardRepository } from "@/core/ports/dashboard.repository";
import type { DashboardQueryInput } from "@/core/schema/dashboard.schema";
import { prisma } from "@/lib/prisma";
import {
  dashboardGameSelect,
  type DashboardDailyCount, type DashboardDistanceRecord, type DashboardGameRecords,
  type DashboardIncompleteRecord, type DashboardRoundAverage, type DashboardRoundCursor,
  type DashboardScoreCount, type DashboardStatusCount,
} from "../../../prisma/types/dashboard";

function startedAt(range: DashboardDateRange): Prisma.DateTimeFilter {
  return { gte: range.start, lt: range.endExclusive };
}

export class DashboardRepositoryImpl implements DashboardRepository {
  async groupGames(range?: DashboardDateRange): Promise<DashboardStatusCount[]> {
    const groups = await prisma.game.groupBy({
      by: ["status"],
      where: range ? { startedAt: startedAt(range) } : {},
      _count: { _all: true },
    });
    return groups;
  }

  async countPlayers(range: DashboardDateRange): Promise<number> {
    return prisma.user.count({ where: { games: { some: { startedAt: startedAt(range) } } } });
  }

  async countPlayingPlayers(): Promise<number> {
    return prisma.user.count({ where: { games: { some: { status: GameStatus.PLAYING } } } });
  }

  async aggregateCompletedRounds(range: DashboardDateRange): Promise<DashboardRoundAverage> {
    return prisma.gameRound.aggregate({
      where: { game: { startedAt: startedAt(range) }, status: RoundStatus.COMPLETED },
      _avg: { score: true }, _count: { _all: true },
    });
  }

  async findCompletedRoundsBatch(range: DashboardDateRange, cursor?: DashboardRoundCursor): Promise<DashboardDistanceRecord[]> {
    return prisma.gameRound.findMany({
      where: { game: { startedAt: startedAt(range) }, status: RoundStatus.COMPLETED },
      select: {
        gameId: true, questionNumber: true, guessedLatitude: true, guessedLongitude: true,
        location: { select: { latitude: true, longitude: true } },
      },
      orderBy: [{ gameId: "asc" }, { questionNumber: "asc" }],
      take: DASHBOARD_QUERY_BATCH_SIZE,
      ...(cursor ? { cursor: { gameId_questionNumber: cursor }, skip: 1 } : {}),
    });
  }

  async findIncompleteGamesBatch(range: DashboardDateRange, cursor?: string): Promise<DashboardIncompleteRecord[]> {
    return prisma.game.findMany({
      where: { startedAt: startedAt(range), status: GameStatus.INCOMPLETE },
      select: {
        id: true,
        rounds: {
          where: { status: RoundStatus.PENDING }, orderBy: { questionNumber: "asc" },
          take: 1, select: { questionNumber: true },
        },
      },
      orderBy: { id: "asc" }, take: DASHBOARD_QUERY_BATCH_SIZE,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  }

  async groupDailyGames(range: DashboardDateRange): Promise<DashboardDailyCount[]> {
    return prisma.$queryRaw<DashboardDailyCount[]>(Prisma.sql`
      SELECT to_char("startedAt" AT TIME ZONE 'UTC' AT TIME ZONE ${DASHBOARD_TIME_ZONE}, 'YYYY-MM-DD') AS date,
             count(*)::integer AS count
      FROM games WHERE "startedAt" >= ${range.start} AND "startedAt" < ${range.endExclusive}
      GROUP BY 1 ORDER BY 1
    `);
  }

  async groupScores(range: DashboardDateRange): Promise<DashboardScoreCount[]> {
    const groups = await prisma.game.groupBy({
      by: ["totalScore"],
      where: { startedAt: startedAt(range), status: GameStatus.COMPLETED, totalScore: { gte: 0, lte: DASHBOARD_MAX_SCORE } },
      _count: { _all: true },
    });
    return groups;
  }

  async findGames(query: DashboardQueryInput, range: DashboardDateRange): Promise<DashboardGameRecords> {
    const where: Prisma.GameWhereInput = {
      startedAt: startedAt(range),
      ...(query.search ? { OR: [
        { id: { contains: query.search, mode: "insensitive" } },
        { user: { name: { contains: query.search, mode: "insensitive" } } },
      ] } : {}),
    };
    const [total, items] = await Promise.all([
      prisma.game.count({ where }),
      prisma.game.findMany({
        where, skip: (query.page - 1) * query.pageSize, take: query.pageSize,
        orderBy: [{ startedAt: "desc" }, { id: "desc" }], select: dashboardGameSelect,
      }),
    ]);
    return { items, total };
  }
}
