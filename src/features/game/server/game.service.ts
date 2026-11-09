import type { GameExitResult } from "@/features/game/game";
import { AppError } from "@/shared/errors/app.error";
import type { GameRepository } from "@/features/game/server/game.repository.port";
import { GameFactory } from "@/features/game/server/game.factory";
import { randomInt } from "node:crypto";
import { GAME_RULES, calculateDistanceMeters, calculateRoundScore, calculateGameSummary } from "../game-scoring";
import type { GamePlayRecord } from "../../../../prisma/types/game";
import type { CurrentGameRound, GameGuessResult } from "../game";
import type { GuessInput } from "../game.schema";

export class GameService {
  constructor(private readonly gameRepository: GameRepository) {}

  async submitGuess(id: string, userId: string, questionNumber: number, input: GuessInput, now = new Date()): Promise<GameGuessResult> {
    const game = await this.ownedGame(id, userId);
    const round = this.pendingRound(game);
    if (round.questionNumber !== questionNumber) throw new AppError("Round already answered or out of order", 409);
    if (!round.startedAt) throw new AppError("Open the current round before submitting a guess", 409);
    if (game.rounds.length !== GAME_RULES.rounds || game.rounds.some((r, i) => r.questionNumber !== i + 1 || (i + 1 < questionNumber && r.status !== "COMPLETED"))) {
      throw new AppError("Game rounds are incomplete", 409);
    }
    const distance = calculateDistanceMeters(input.guessedLatitude, input.guessedLongitude, round.location.latitude, round.location.longitude);
    const score = calculateRoundScore(distance);
    const playTimeSeconds = Math.max(0, Math.floor((now.getTime() - round.startedAt.getTime()) / 1000));
    const results = game.rounds.map((r) => r.questionNumber === questionNumber ? { ...r, score, playTimeSeconds } : r);
    const summary = calculateGameSummary(results);
    // Scores before this round are immutable; the repository rechecks the pending
    // round under a game-row lock before applying this snapshot's final totals.
    await this.gameRepository.saveGuess({
      gameId: id, userId, questionNumber, ...input, score, playTimeSeconds, finishedAt: now,
      ...(questionNumber === GAME_RULES.rounds ? { totalScore: summary.totalScore } : {}),
    });
    const accumulatedScore = results.filter((r) => r.questionNumber <= questionNumber).reduce((sum, r) => sum + r.score, 0);
    return GameFactory.toGuessResult(round, input, distance, score, accumulatedScore);
  }

  private async ownedGame(id: string, userId: string): Promise<GamePlayRecord> {
    const game = await this.gameRepository.findGame(id);
    if (!game) throw new AppError("Game not found", 404);
    if (game.userId !== userId) throw new AppError("Forbidden", 403);
    return game;
  }

  private pendingRound(game: GamePlayRecord) {
    if (game.status !== "PLAYING") throw new AppError("Game is no longer playing", 409);
    const round = game.rounds.find((round) => round.status === "PENDING");
    if (!round?.locationImage) throw new AppError("No playable round available", 409);
    return round;
  }

  async currentRound(id: string, userId: string, now = new Date()): Promise<CurrentGameRound> {
    const round = this.pendingRound(await this.ownedGame(id, userId));
    const opened = await this.gameRepository.openRound(id, userId, round.questionNumber, now);
    return GameFactory.toCurrentRound(this.pendingRound(opened));
  }

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
