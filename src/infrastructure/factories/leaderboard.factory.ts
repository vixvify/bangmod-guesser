import type {
  LeaderboardResult,
} from "@/core/domain/leaderboard";
import type {
  GameHistoryItem,
  ProfileResult,
} from "@/core/domain/profile";
import type {
  ProfileGameRecord,
  ProfileUserRecord,
} from "../../../prisma/types/leaderboard";
import { haversineDistanceMeters } from "@/lib/calculate-distance";
import { calculateScoreTier } from "@/lib/utils";

export const LeaderboardFactory = {
  toResult(
    entries: LeaderboardResult["entries"],
    myRank: LeaderboardResult["myRank"],
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
      if (bestRoundScore === undefined || round.score > bestRoundScore) {
        bestRoundScore = round.score;
        bestRoundNumber = round.questionNumber;
      }

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
      }
    }

    const totalScore = game.totalScore ?? 0;

    return {
      id: game.id,
      status: game.status,
      totalScore,
      grade: calculateScoreTier(totalScore),
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

};
