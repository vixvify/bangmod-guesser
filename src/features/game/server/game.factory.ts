import type { GameStateRecord, GamePlayRecord } from "../../../../prisma/types/game";
import type { CurrentGameRound, GameExitResult, GameGuessResult } from "../game";
import type { GuessInput } from "../game.schema";
import { AppError } from "@/shared/errors/app.error";
import { GAME_DEFAULTS } from "../game.constants";

export const GameFactory = {
  toGuessResult(round: GamePlayRecord["rounds"][number], guess: GuessInput, distance: number | null, score: number, accumulatedScore: number): GameGuessResult {
    return {
      ...guess, distanceMeters: distance === null ? null : Math.round(distance * 100) / 100,
      timedOut: guess.guessedLatitude === null, score, accumulatedScore,
      imageUrl: round.locationImage?.imageUrl ?? null,
      location: {
        latitude: round.location.latitude, longitude: round.location.longitude,
        name: round.location.name, description: round.location.description,
      },
    };
  },
  toCurrentRound(round: GamePlayRecord["rounds"][number]): CurrentGameRound {
    if (!round.locationImage) throw new AppError("Round image unavailable", 409);
    const deadlineAt = round.startedAt ? new Date(round.startedAt.getTime() + GAME_DEFAULTS.roundDurationSeconds * 1000).toISOString() : null;
    return { questionNumber: round.questionNumber, imageUrl: round.locationImage.imageUrl, deadlineAt };
  },
  toExitResult(record: GameStateRecord): GameExitResult {
    return {
      id: record.id,
      status: record.status,
      finishedAt: record.finishedAt?.toISOString() ?? null,
    };
  },
};
