import type { GameSummaryResult } from "../game";
import { GAME_RULES } from "../game.constants";

export function calculateRoundScore(distanceMeters: number): number {
  const normalizedDistance = Math.max(0, distanceMeters) / GAME_RULES.distanceReferenceMeters;
  const decay = Math.log(GAME_RULES.distanceReferenceRatio) * normalizedDistance ** GAME_RULES.distanceDecayExponent;
  return Math.round(GAME_RULES.maxRoundScore * Math.exp(decay));
}

export function calculateTimeBonus(totalTimeSeconds: number): number {
  const fraction = (GAME_RULES.zeroBonusSeconds - totalTimeSeconds)
    / (GAME_RULES.zeroBonusSeconds - GAME_RULES.fullBonusSeconds);
  return Math.round(GAME_RULES.maxTimeBonus * Math.max(0, Math.min(1, fraction)));
}

export function calculateGameSummary(
  rounds: readonly { score: number; playTimeSeconds: number | null }[],
  storedTotalScore?: number,
): GameSummaryResult {
  const baseScore = rounds.reduce((sum, round) => sum + round.score, 0);
  const totalTimeSeconds = rounds.reduce((sum, round) => sum + (round.playTimeSeconds ?? 0), 0);
  const bonusScore = storedTotalScore === undefined
    ? calculateTimeBonus(totalTimeSeconds)
    : storedTotalScore - baseScore;
  return { baseScore, totalTimeSeconds, bonusScore, totalScore: baseScore + bonusScore };
}
