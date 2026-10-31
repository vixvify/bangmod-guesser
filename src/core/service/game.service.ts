import type { GameExitResult } from "@/core/domain/game";
import { AppError } from "@/core/errors/app.error";
import type { GameRepository } from "@/core/ports/game.repository";
import { GameFactory } from "@/infrastructure/factories/game.factory";

export class GameService {
  constructor(private readonly gameRepository: GameRepository) {}

  async exitGame(id: string, userId: string, now = new Date()): Promise<GameExitResult> {
    const existing = await this.gameRepository.findById(id);
    if (!existing) throw new AppError("Game not found", 404);
    if (existing.userId !== userId) throw new AppError("Forbidden", 403);
    if (existing.status !== "PLAYING") return GameFactory.toExitResult(existing);

    const record = await this.gameRepository.exitPlayingGame(id, userId, now);
    if (!record) throw new AppError("Game not found", 404);
    return GameFactory.toExitResult(record);
  }
}
