import type {
  LeaderboardEntry,
  LeaderboardResult,
} from "@/core/domain/leaderboard";
import type {
  GameHistoryItem,
  ProfileResult,
} from "@/core/domain/profile";
import type {
  LeaderboardUserRecord,
  ProfileGameRecord,
  ProfileUserRecord,
} from "@/core/ports/leaderboard.repository";
import { haversineDistanceMeters } from "@/lib/calculate-distance";

export const LeaderboardFactory = {
  toEntry(
    user: LeaderboardUserRecord,
    rank: number,
  ): LeaderboardEntry {
    return {
      rank,
      name: user.name,
      gamesPlayed: user.games.length,
      totalScore: user.games.reduce(
        (sum, game) => sum + (game.totalScore ?? 0),
        0,
      ),
    };
  },

  toResult(
    entries: LeaderboardEntry[],
    myRank: LeaderboardEntry | null,
  ): LeaderboardResult {
    return {
      entries,
      myRank,
    };
  },

  toProfile(
    user: ProfileUserRecord,
    totalGames: number,
    page: number,
    pageSize: number,
  ): ProfileResult {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      games: user.games.map((game) => this.toGameHistory(game)),
      pagination: {
        page,
        pageSize,
        totalGames,
        totalPages: Math.ceil(totalGames / pageSize),
      },
    };
  },

  toGameHistory(game: ProfileGameRecord): GameHistoryItem {
    let bestDistanceMeters: number | undefined;
    let bestRoundScore: number | undefined;
    let bestRoundNumber: number | undefined;

    for (const round of game.rounds) {
      if (
        round.guessedLatitude === null ||
        round.guessedLongitude === null
      ) {
        continue;
      }

      const distance = haversineDistanceMeters(
        {
          latitude: round.location.latitude,
          longitude: round.location.longitude,
        },
        {
          latitude: round.guessedLatitude,
          longitude: round.guessedLongitude,
        },
      );

      if (
        bestDistanceMeters === undefined ||
        distance < bestDistanceMeters
      ) {
        bestDistanceMeters = distance;
        bestRoundScore = round.score;
        bestRoundNumber = round.questionNumber;
      }
    }

    const totalScore = game.totalScore ?? 0;

    return {
      id: game.id,
      status: game.status,
      totalScore,
      grade: this.getGrade(totalScore),
      playedAt: game.startedAt.toISOString(),
      ...(bestDistanceMeters !== undefined
        ? { bestDistanceMeters }
        : {}),
      ...(bestRoundScore !== undefined
        ? { bestRoundScore }
        : {}),
      ...(bestRoundNumber !== undefined
        ? { bestRoundNumber }
        : {}),
    };
  },

  getGrade(score: number): GameHistoryItem["grade"] {
    if (score >= 4750) return "SSS";
    if (score >= 4200) return "S";
    if (score >= 3350) return "A";
    if (score >= 2500) return "B";
    if (score >= 1650) return "C";
    return "D";
  },
};