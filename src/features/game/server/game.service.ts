import { randomInt } from "node:crypto";
import type { GamePlayRecord } from "../../../../prisma/types/game";
import type {
  CurrentGameRound,
  GameExitResult,
  GameGuessResult,
  GameSummaryResult,
} from "../game";
import type { GuessInput } from "../game.schema";
import type { GameRepository } from "./game.repository.port";
import { GAME_DEFAULTS, GAME_ROUND_COUNT } from "../game.constants";
import {
  calculateRoundScore,
  calculateGameSummary,
} from "@/shared/lib/game-scoring";
import { GameFactory } from "./game.factory";
import { AppError } from "@/shared/errors/app.error";
import { haversineDistanceMeters } from "@/shared/lib/calculate-distance";

export class GameService {
  constructor(private readonly gameRepository: GameRepository) {}

  async summary(id: string, userId: string): Promise<GameSummaryResult> {
    const game = await this.ownedGame(id, userId);
    if (
      game.status !== "COMPLETED" ||
      game.totalScore === null ||
      game.rounds.length !== GAME_ROUND_COUNT ||
      game.rounds.some(
        (round, index) =>
          round.questionNumber !== index + 1 || !this.hasCompleteAnswer(round),
      )
    ) {
      throw new AppError(
        "Complete all five rounds before viewing the summary",
        409,
      );
    }
    return calculateGameSummary(game.rounds, game.totalScore);
  }

  async submitGuess(
    id: string,
    userId: string,
    questionNumber: number,
    input: GuessInput,
    now = new Date(),
  ): Promise<GameGuessResult> {
    const game = await this.ownedGame(id, userId);
    const round = this.pendingRound(game);
    if (round.questionNumber !== questionNumber)
      throw new AppError("Round already answered or out of order", 409);
    if (!round.startedAt)
      throw new AppError(
        "Open the current round before submitting a guess",
        409,
      );
    if (
      game.rounds.length !== GAME_ROUND_COUNT ||
      game.rounds.some(
        (r, i) =>
          r.questionNumber !== i + 1 ||
          (i + 1 < questionNumber && !this.hasCompleteAnswer(r)),
      )
    ) {
      throw new AppError("Game rounds are incomplete", 409);
    }
    const elapsedMilliseconds = now.getTime() - round.startedAt.getTime();
    const durationSeconds = GAME_DEFAULTS.roundDurationSeconds;
    const timedOut = elapsedMilliseconds >= durationSeconds * 1000;
    if (
      !timedOut &&
      (input.guessedLatitude === null || input.guessedLongitude === null)
    ) {
      throw new AppError("A guess is required before the deadline", 409);
    }
    const guess = timedOut
      ? { guessedLatitude: null, guessedLongitude: null }
      : input;
    const distance =
      guess.guessedLatitude === null || guess.guessedLongitude === null
        ? null
        : haversineDistanceMeters(round.location, {
            latitude: guess.guessedLatitude,
            longitude: guess.guessedLongitude,
          });
    const score = distance === null ? 0 : calculateRoundScore(distance);
    const playTimeSeconds = timedOut
      ? durationSeconds
      : Math.max(0, Math.floor(elapsedMilliseconds / 1000));
    const results = game.rounds.map((r) =>
      r.questionNumber === questionNumber
        ? { ...r, score, playTimeSeconds }
        : r,
    );
    await this.gameRepository.saveGuess({
      gameId: id,
      userId,
      questionNumber,
      ...guess,
      score,
      playTimeSeconds,
      finishedAt: now,
      ...(questionNumber === GAME_ROUND_COUNT
        ? { totalScore: calculateGameSummary(results).totalScore }
        : {}),
    });
    const accumulatedScore = results
      .filter((r) => r.questionNumber <= questionNumber)
      .reduce((sum, r) => sum + r.score, 0);
    return GameFactory.toGuessResult(
      round,
      guess,
      distance,
      score,
      accumulatedScore,
    );
  }

  async roundResult(
    id: string,
    userId: string,
    questionNumber: number,
  ): Promise<GameGuessResult> {
    const game = await this.ownedGame(id, userId);
    const round = game.rounds.find(
      (round) => round.questionNumber === questionNumber,
    );
    if (!round) throw new AppError("Round not found", 404);
    if (!this.hasCompleteAnswer(round))
      throw new AppError("Round result is not available", 409);
    const guess = {
      guessedLatitude: round.guessedLatitude,
      guessedLongitude: round.guessedLongitude,
    };
    const distance =
      guess.guessedLatitude === null || guess.guessedLongitude === null
        ? null
        : haversineDistanceMeters(round.location, {
            latitude: guess.guessedLatitude,
            longitude: guess.guessedLongitude,
          });
    const accumulatedScore = game.rounds
      .filter((result) => result.questionNumber <= questionNumber)
      .reduce((sum, result) => sum + result.score, 0);
    return GameFactory.toGuessResult(
      round,
      guess,
      distance,
      round.score,
      accumulatedScore,
    );
  }

  private async ownedGame(id: string, userId: string): Promise<GamePlayRecord> {
    const game = await this.gameRepository.findGame(id);
    if (!game) throw new AppError("Game not found", 404);
    if (game.userId !== userId) throw new AppError("Forbidden", 403);
    return game;
  }

  private hasCompleteAnswer(round: GamePlayRecord["rounds"][number]): boolean {
    if (round.status !== "COMPLETED" || round.playTimeSeconds === null)
      return false;
    const timedOut =
      round.startedAt !== null &&
      round.score === 0 &&
      round.playTimeSeconds === GAME_DEFAULTS.roundDurationSeconds &&
      round.guessedLatitude === null &&
      round.guessedLongitude === null;
    return (
      timedOut ||
      (round.guessedLatitude !== null && round.guessedLongitude !== null)
    );
  }

  private pendingRound(game: GamePlayRecord) {
    if (game.status !== "PLAYING")
      throw new AppError("Game is no longer playing", 409);
    const round = game.rounds.find((round) => round.status === "PENDING");
    if (!round?.locationImage)
      throw new AppError("No playable round available", 409);
    return round;
  }

  async currentRound(
    id: string,
    userId: string,
    now = new Date(),
  ): Promise<CurrentGameRound> {
    const round = this.pendingRound(await this.ownedGame(id, userId));
    const opened = await this.gameRepository.openRound(
      id,
      userId,
      round.questionNumber,
      now,
    );
    return GameFactory.toCurrentRound(this.pendingRound(opened));
  }

  async createGame(userId: string): Promise<{ gameId: string }> {
    const candidates = await this.gameRepository.findCandidates();
    if (candidates.length < GAME_ROUND_COUNT)
      throw new AppError(
        "At least five active locations with images are required",
        409,
      );
    for (let i = 0; i < GAME_ROUND_COUNT; i++) {
      const j = randomInt(i, candidates.length);
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const rounds = candidates
      .slice(0, GAME_ROUND_COUNT)
      .map((location, index) => ({
        questionNumber: index + 1,
        locationId: location.id,
        imageNumber:
          location.images[randomInt(location.images.length)].imageNumber,
      }));
    const game = await this.gameRepository.createGame(userId, rounds);
    return { gameId: game.id };
  }

  async exitGame(
    id: string,
    userId: string,
    now = new Date(),
  ): Promise<GameExitResult> {
    const existing = await this.gameRepository.findById(id);
    if (!existing) throw new AppError("Game not found", 404);
    if (existing.userId !== userId) throw new AppError("Forbidden", 403);
    if (existing.status !== "PLAYING")
      return GameFactory.toExitResult(existing);

    const record = await this.gameRepository.exitPlayingGame(id, userId, now);
    if (!record) throw new AppError("Game not found", 404);
    return GameFactory.toExitResult(record);
  }
}
