import { GameStatus } from "@prisma/client";
import type { GameRepository } from "@/features/game/server/game.repository.port";
import { prisma } from "@/shared/lib/prisma";
import { gameStateSelect, type GameStateRecord } from "../../../../prisma/types/game";
import { gameCandidateSelect } from "../../../../prisma/types/game";
import type { NewGameRound } from "../game";
import { AppError } from "@/shared/errors/app.error";

export class GameRepositoryImpl implements GameRepository {
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
