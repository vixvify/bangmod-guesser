import type { GameSummaryResult } from "./game";

export const GAME_RULES = {
  rounds: 5,
  maxRoundScore: 1000,
  scoreDecayMeters: -25 / Math.log(0.7),
  maxTimeBonus: 500,
  fullBonusSeconds: 120,
  zeroBonusSeconds: 300,
} as const;

export function calculateRoundScore(distanceMeters: number): number {
  return Math.round(GAME_RULES.maxRoundScore * Math.exp(-Math.max(0, distanceMeters) / GAME_RULES.scoreDecayMeters));
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
