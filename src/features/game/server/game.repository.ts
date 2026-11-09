import { GameStatus, type Prisma } from "@prisma/client";
import type { GameRepository } from "@/features/game/server/game.repository.port";
import { prisma } from "@/shared/lib/prisma";
import { gameStateSelect, type GameStateRecord } from "../../../../prisma/types/game";
import { gameCandidateSelect, gamePlayInclude } from "../../../../prisma/types/game";
import type { NewGameRound } from "../game";
import { AppError } from "@/shared/errors/app.error";

export class GameRepositoryImpl implements GameRepository {
  async findGame(id: string) {
    return prisma.game.findUnique({ where: { id }, include: gamePlayInclude });
  }

  private async lockPlayingGame(transaction: Prisma.TransactionClient, id: string, userId: string) {
    // The parent-row write locks current-round, guess and the existing exit write
    // in the same order. A terminal game cannot be reopened by a stale request.
    const result = await transaction.game.updateMany({
      where: { id, userId, status: "PLAYING" }, data: { status: "PLAYING" },
    });
    if (result.count !== 1) throw new AppError("Game is no longer playing", 409);
  }

  async openRound(id: string, userId: string, questionNumber: number, now: Date) {
    return prisma.$transaction(async (transaction) => {
      await this.lockPlayingGame(transaction, id, userId);
      const current = await transaction.gameRound.findFirst({
        where: { gameId: id, status: "PENDING" }, orderBy: { questionNumber: "asc" },
      });
      if (current?.questionNumber !== questionNumber) throw new AppError("Current round changed; please retry", 409);
      await transaction.gameRound.updateMany({
        where: { gameId: id, questionNumber, status: "PENDING", startedAt: null },
        data: { startedAt: now },
      });
      return transaction.game.findUniqueOrThrow({ where: { id }, include: gamePlayInclude });
    });
  }

  async findCandidates() {
    return prisma.location.findMany({
      where: { status: "ACTIVE", images: { some: {} } },
      select: gameCandidateSelect,
    });
  }

  async createGame(userId: string, rounds: NewGameRound[]) {
    return prisma.$transaction(async (transaction) => {
      // Share locks serialize image edits against selecting this game's images.
      // Lock in a stable order to avoid deadlocks between simultaneous new games.
      for (const id of rounds.map((round) => round.locationId).sort()) {
        await transaction.$queryRaw`SELECT "id" FROM "locations" WHERE "id" = ${id} FOR SHARE`;
      }
      for (const round of rounds) {
        const image = await transaction.locationImage.findUnique({
          where: { locationId_imageNumber: { locationId: round.locationId, imageNumber: round.imageNumber } },
          select: { location: { select: { status: true } } },
        });
        if (image?.location.status !== "ACTIVE") throw new AppError("Game locations changed; please retry", 409);
      }
      return transaction.game.create({
        data: { userId, status: "PLAYING", rounds: { create: rounds.map((round) => ({ ...round, status: "PENDING" })) } },
        select: { id: true },
      });
    });
  }

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
