export const GAME_RULES = {
  rounds: 5,
  maxRoundScore: 1000,
  // Exponential decay: exactly 700 points at 25 m, before integer rounding.
  scoreDecayMeters: -25 / Math.log(0.7),
  maxTimeBonus: 500,
  fullBonusSeconds: 120,
  zeroBonusSeconds: 300,
} as const;

export function calculateDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const a = Math.sin(radians(lat2 - lat1) / 2) ** 2
    + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(radians(lng2 - lng1) / 2) ** 2;
  return 6_371_000 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))));
}

export function calculateRoundScore(distanceMeters: number): number {
  return Math.round(GAME_RULES.maxRoundScore * Math.exp(-Math.max(0, distanceMeters) / GAME_RULES.scoreDecayMeters));
}

export function calculateTimeBonus(totalTimeSeconds: number): number {
  const fraction = (GAME_RULES.zeroBonusSeconds - totalTimeSeconds)
    / (GAME_RULES.zeroBonusSeconds - GAME_RULES.fullBonusSeconds);
  return Math.round(GAME_RULES.maxTimeBonus * Math.max(0, Math.min(1, fraction)));
}

export function calculateGameSummary(rounds: readonly { score: number; playTimeSeconds: number | null }[]) {
  const baseScore = rounds.reduce((sum, round) => sum + round.score, 0);
  const totalTimeSeconds = rounds.reduce((sum, round) => sum + (round.playTimeSeconds ?? 0), 0);
  const bonusScore = calculateTimeBonus(totalTimeSeconds);
  return { baseScore, totalTimeSeconds, bonusScore, totalScore: baseScore + bonusScore };
}
