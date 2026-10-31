import { GameStatus } from "@prisma/client";
import type { GameRepository } from "@/core/ports/game.repository";
import { prisma } from "@/lib/prisma";
import { gameStateSelect, type GameStateRecord } from "../../../prisma/types/game";

export class GameRepositoryImpl implements GameRepository {
  async findById(id: string): Promise<GameStateRecord | null> {
    return prisma.game.findUnique({ where: { id }, select: gameStateSelect });
  }

  async exitPlayingGame(id: string, userId: string, finishedAt: Date): Promise<GameStateRecord | null> {
    return prisma.$transaction(async (transaction) => {
      // Check the status in the write itself: a game may finish after the service reads it.
      await transaction.game.updateMany({
        where: { id, userId, status: GameStatus.PLAYING },
        data: { status: GameStatus.INCOMPLETE, finishedAt },
      });
      return transaction.game.findUnique({ where: { id, userId }, select: gameStateSelect });
    });
  }
}
