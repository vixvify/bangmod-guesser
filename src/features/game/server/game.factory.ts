import type { GameStateRecord, GamePlayRecord } from "../../../../prisma/types/game";
import type { CurrentGameRound, GameExitResult, GameGuessResult } from "../game";
import type { GuessInput } from "../game.schema";
import { AppError } from "@/shared/errors/app.error";

export const GameFactory = {
  toGuessResult(round: GamePlayRecord["rounds"][number], guess: GuessInput, distance: number, score: number, accumulatedScore: number): GameGuessResult {
    if (!round.locationImage) throw new AppError("Round image unavailable", 409);
    return {
      ...guess, distanceMeters: Math.round(distance * 100) / 100, score, accumulatedScore,
      imageUrl: round.locationImage.imageUrl,
      location: {
        latitude: round.location.latitude, longitude: round.location.longitude,
        name: round.location.name, description: round.location.description,
      },
    };
  },
  toCurrentRound(round: GamePlayRecord["rounds"][number]): CurrentGameRound {
    if (!round.locationImage) throw new AppError("Round image unavailable", 409);
    return { questionNumber: round.questionNumber, imageUrl: round.locationImage.imageUrl };
  },
  toExitResult(record: GameStateRecord): GameExitResult {
    return {
      id: record.id,
      status: record.status,
      finishedAt: record.finishedAt?.toISOString() ?? null,
    };
  },
};
