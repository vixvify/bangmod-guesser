import type { GameExitResult } from "@/features/game/game";
import type { GameStateRecord } from "../../../../prisma/types/game";
import type { GamePlayRecord } from "../../../../prisma/types/game";
import type { CurrentGameRound } from "../game";
import { AppError } from "@/shared/errors/app.error";

export const GameFactory = {
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
