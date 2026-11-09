import type { GameExitResult } from "@/features/game/game";
import { AppError } from "@/shared/errors/app.error";
import type { GameRepository } from "@/features/game/server/game.repository.port";
import { GameFactory } from "@/features/game/server/game.factory";
import { randomInt } from "node:crypto";
import { GAME_RULES } from "../game-scoring";

export class GameService {
  constructor(private readonly gameRepository: GameRepository) {}

  async createGame(userId: string) {
    const candidates = await this.gameRepository.findCandidates();
    if (candidates.length < GAME_RULES.rounds) throw new AppError("At least five active locations with images are required", 409);
    // Partial Fisher–Yates: unique, uniformly selected locations, then one image each.
    for (let i = 0; i < GAME_RULES.rounds; i++) {
      const j = randomInt(i, candidates.length);
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const rounds = candidates.slice(0, GAME_RULES.rounds).map((location, index) => ({
      questionNumber: index + 1,
      locationId: location.id,
      imageNumber: location.images[randomInt(location.images.length)].imageNumber,
    }));
    const game = await this.gameRepository.createGame(userId, rounds);
    return { gameId: game.id };
  }

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
