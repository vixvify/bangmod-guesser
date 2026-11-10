import { GameStatus, Prisma } from "@prisma/client";
import type { GameRepository } from "@/features/game/server/game.repository.port";
import { prisma } from "@/shared/lib/prisma";
import { gameStateSelect, gameCandidateSelect, gamePlayInclude,
  type GameStateRecord, type GamePlayRecord, type GameCandidateRecord,
} from "../../../../prisma/types/game";
import type { NewGameRound, SaveGameGuess } from "../game";
import { AppError } from "@/shared/errors/app.error";
import { GAME_DEFAULTS } from "../game.constants";

export class GameRepositoryImpl implements GameRepository {
  async saveGuess(input: SaveGameGuess): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      await this.lockPlayingGame(transaction, input.gameId, input.userId);
      const current = await transaction.gameRound.findFirst({
        where: { gameId: input.gameId, status: "PENDING" }, orderBy: { questionNumber: "asc" },
      });
      if (current?.questionNumber !== input.questionNumber) throw new AppError("Round already answered or out of order", 409);
      const deadlineCutoff = new Date(input.finishedAt.getTime() - GAME_DEFAULTS.roundDurationSeconds * 1000);
      const startedAt = input.guessedLatitude === null ? { lte: deadlineCutoff } : { gt: deadlineCutoff };
      const saved = await transaction.gameRound.updateMany({
        where: { gameId: input.gameId, questionNumber: input.questionNumber, status: "PENDING", startedAt },
        data: {
          guessedLatitude: input.guessedLatitude, guessedLongitude: input.guessedLongitude,
          score: input.score, playTimeSeconds: input.playTimeSeconds, status: "COMPLETED",
        },
      });
      if (saved.count !== 1) throw new AppError("Round already answered or not opened", 409);
      if (input.totalScore !== undefined) {
        await transaction.game.update({
          where: { id: input.gameId },
          data: { status: "COMPLETED", finishedAt: input.finishedAt, totalScore: input.totalScore },
        });
      }
    });
  }

  async findGame(id: string): Promise<GamePlayRecord | null> {
    return prisma.game.findUnique({ where: { id }, include: gamePlayInclude });
  }

  private async lockPlayingGame(transaction: Prisma.TransactionClient, id: string, userId: string) {
    const result = await transaction.game.updateMany({
      where: { id, userId, status: "PLAYING" }, data: { status: "PLAYING" },
    });
    if (result.count !== 1) throw new AppError("Game is no longer playing", 409);
  }

  async openRound(id: string, userId: string, questionNumber: number, now: Date): Promise<GamePlayRecord> {
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

  async findCandidates(): Promise<GameCandidateRecord[]> {
    return prisma.location.findMany({
      where: { status: "ACTIVE", images: { some: {} } },
      select: gameCandidateSelect,
    });
  }

  async createGame(userId: string, rounds: NewGameRound[]): Promise<{ id: string }> {
    return prisma.$transaction(async (transaction) => {
      const locationIds = rounds.map((round) => round.locationId);
      await transaction.$queryRaw`
        SELECT "id" FROM "locations"
        WHERE "id" IN (${Prisma.join(locationIds)})
        ORDER BY "id" FOR SHARE
      `;
      const images = await transaction.locationImage.findMany({
        where: {
          OR: rounds.map(({ locationId, imageNumber }) => ({ locationId, imageNumber })),
          location: { status: "ACTIVE" },
        },
        select: { locationId: true, imageNumber: true },
      });
      if (images.length !== rounds.length) throw new AppError("Game locations changed; please retry", 409);
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
      await transaction.game.updateMany({
        where: { id, userId, status: GameStatus.PLAYING },
        data: { status: GameStatus.INCOMPLETE, finishedAt },
      });
      return transaction.game.findUnique({ where: { id, userId }, select: gameStateSelect });
    });
  }
}
