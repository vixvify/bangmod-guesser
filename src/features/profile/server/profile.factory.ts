import type { GameHistoryItem, ProfileResult } from "../profile";
import type { ProfileGameRecord, ProfileUserRecord } from "../../../../prisma/types/profile";
import { haversineDistanceMeters } from "@/shared/lib/calculate-distance";
import { calculateScoreTier } from "@/shared/lib/utils";

export const ProfileFactory = {
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

      if (round.guessedLatitude === null || round.guessedLongitude === null) {
        continue;
      }

      const distance = haversineDistanceMeters(
        { latitude: round.location.latitude, longitude: round.location.longitude },
        { latitude: round.guessedLatitude, longitude: round.guessedLongitude },
      );

      if (bestDistanceMeters === undefined || distance < bestDistanceMeters) {
        bestDistanceMeters = distance;
      }
    }

    const totalScore = game.totalScore;

    return {
      id: game.id,
      status: game.status,
      totalScore,
      grade: totalScore === null ? null : calculateScoreTier(totalScore),
      playedAt: game.startedAt.toISOString(),
      ...(bestDistanceMeters !== undefined ? { bestDistanceMeters } : {}),
      ...(bestRoundScore !== undefined ? { bestRoundScore } : {}),
      ...(bestRoundNumber !== undefined ? { bestRoundNumber } : {}),
    };
  },
};
