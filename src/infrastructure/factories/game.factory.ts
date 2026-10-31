import type { GameExitResult } from "@/core/domain/game";
import type { GameStateRecord } from "../../../prisma/types/game";

export const GameFactory = {
  toExitResult(record: GameStateRecord): GameExitResult {
    return {
      id: record.id,
      status: record.status,
      finishedAt: record.finishedAt?.toISOString() ?? null,
    };
  },
};
