import type { GameStateRecord } from "../../../prisma/types/game";

export interface GameRepository {
  findById(id: string): Promise<GameStateRecord | null>;
  exitPlayingGame(id: string, userId: string, finishedAt: Date): Promise<GameStateRecord | null>;
}
