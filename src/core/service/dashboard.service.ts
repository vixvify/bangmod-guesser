import { DASHBOARD_QUERY_BATCH_SIZE, DASHBOARD_ROUND_MAX_SCORE } from "@/core/constants/dashboard";
import type { DashboardDateRange, DashboardGameLogs, DashboardOverview } from "@/core/domain/dashboard";
import { dashboardChangePercent, dashboardDistance, getDashboardDropOff, getDashboardScores, roundDashboardNumber } from "@/core/domain/dashboard-metrics";
import { getDashboardPeriod, getDashboardTodayPeriod } from "@/core/domain/dashboard-period";
import type { DashboardRepository } from "@/core/ports/dashboard.repository";
import type { DashboardQueryInput } from "@/core/schema/dashboard.schema";
import { DashboardFactory } from "@/infrastructure/factories/dashboard.factory";
import { getPagination } from "@/lib/utils";

export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getOverview(query: DashboardQueryInput, now = new Date()): Promise<DashboardOverview> {
    const period = getDashboardPeriod(query, now);
    const today = getDashboardTodayPeriod(now);
    const previous = { start: period.previousStart, endExclusive: period.previousEndExclusive };
    const yesterday = { start: today.previousStart, endExclusive: today.previousEndExclusive };
    const [currentRecords, previousRecords, allTimeRecords, players, previousPlayers, playing, average, distances, dropOffRounds, daily, scores] = await Promise.all([
      this.dashboardRepository.groupGames(period),
      this.dashboardRepository.groupGames(previous),
      this.dashboardRepository.groupGames(),
      this.dashboardRepository.countPlayers(today),
      this.dashboardRepository.countPlayers(yesterday),
      this.dashboardRepository.countPlayingPlayers(),
      this.dashboardRepository.aggregateCompletedRounds(period),
      this.getAverageDistance(period),
      this.getDropOffRounds(period),
      this.dashboardRepository.groupDailyGames(period),
      this.dashboardRepository.groupScores(period),
    ]);
    const current = DashboardFactory.toGameCounts(currentRecords);
    const previousCounts = DashboardFactory.toGameCounts(previousRecords);
    const allTime = DashboardFactory.toGameCounts(allTimeRecords);
    const dailyCounts = new Map(daily.map((day) => [day.date, day.count]));
    const score = average._avg.score;
    return {
      period: period.output, generatedAt: now.toISOString(),
      totalGames: {
        count: current.total, previousCount: previousCounts.total,
        changePercent: dashboardChangePercent(current.total, previousCounts.total),
      },
      players: {
        date: today.output.startDate, previousDate: today.output.previousStartDate, timeZone: today.output.timeZone,
        count: players, previousCount: previousPlayers, changePercent: dashboardChangePercent(players, previousPlayers), playing,
      },
      roundAverage: {
        score: score === null ? null : roundDashboardNumber(score), maxScore: DASHBOARD_ROUND_MAX_SCORE,
        percentage: score === null ? null : roundDashboardNumber(score / DASHBOARD_ROUND_MAX_SCORE * 100),
        count: average._count._all, ...distances,
      },
      dropOff: { ...getDashboardDropOff(current, allTime), ...dropOffRounds },
      dailyGames: period.dates.map((date) => ({ date, count: dailyCounts.get(date) ?? 0 })),
      scores: getDashboardScores(DashboardFactory.toScoreFrequencies(scores)),
    };
  }

  async getGames(query: DashboardQueryInput, now = new Date()): Promise<DashboardGameLogs> {
    const { items, total } = await this.dashboardRepository.findGames(query, getDashboardPeriod(query, now));
    return {
      total, page: query.page, pageSize: query.pageSize,
      totalPages: getPagination(total, query.page, query.pageSize).pageCount,
      items: items.map(DashboardFactory.toGame),
    };
  }

  private async getAverageDistance(range: DashboardDateRange) {
    let cursor: { gameId: string; questionNumber: number } | undefined;
    let total = 0;
    let count = 0;
    while (true) {
      const rounds = await this.dashboardRepository.findCompletedRoundsBatch(range, cursor);
      for (const round of rounds) {
        const distance = dashboardDistance(round);
        if (distance !== null) { total += distance; count += 1; }
      }
      if (rounds.length < DASHBOARD_QUERY_BATCH_SIZE) break;
      const last = rounds[rounds.length - 1];
      cursor = { gameId: last.gameId, questionNumber: last.questionNumber };
    }
    return { distanceMeters: count === 0 ? null : roundDashboardNumber(total / count), distanceCount: count };
  }

  private async getDropOffRounds(range: DashboardDateRange) {
    let cursor: string | undefined;
    let unknownRoundCount = 0;
    const counts = new Map<number, number>();
    while (true) {
      const games = await this.dashboardRepository.findIncompleteGamesBatch(range, cursor);
      for (const game of games) {
        const questionNumber = game.rounds[0]?.questionNumber;
        if (questionNumber === undefined) unknownRoundCount += 1;
        else counts.set(questionNumber, (counts.get(questionNumber) ?? 0) + 1);
      }
      if (games.length < DASHBOARD_QUERY_BATCH_SIZE) break;
      cursor = games[games.length - 1].id;
    }
    const byRound = [...counts].sort(([first], [second]) => first - second)
      .map(([questionNumber, count]) => ({ questionNumber, count }));
    const mostCommon = byRound.reduce<typeof byRound[number] | null>((best, round) =>
      best === null || round.count > best.count ? round : best, null);
    return { byRound, mostCommonRound: mostCommon?.questionNumber ?? null, unknownRoundCount };
  }
}
