const SCORE_RULES = {
  maxRoundScore: 1000,
  distanceReferenceMeters: 25,
  distanceReferenceRatio: 0.7,
  distanceDecayExponent: Math.log(Math.log(0.2) / Math.log(0.7)) / Math.log(2),
  maxTimeBonus: 300,
  fullBonusSeconds: 10,
  zeroBonusSeconds: 200,
} as const;

export function calculateRoundScore(distanceMeters: number): number {
  const normalizedDistance = Math.max(0, distanceMeters) / SCORE_RULES.distanceReferenceMeters;
  const decay = Math.log(SCORE_RULES.distanceReferenceRatio) * normalizedDistance ** SCORE_RULES.distanceDecayExponent;
  return Math.round(SCORE_RULES.maxRoundScore * Math.exp(decay));
}

export function calculateTimeBonus(totalTimeSeconds: number): number {
  const fraction = (SCORE_RULES.zeroBonusSeconds - totalTimeSeconds)
    / (SCORE_RULES.zeroBonusSeconds - SCORE_RULES.fullBonusSeconds);
  return Math.round(SCORE_RULES.maxTimeBonus * Math.max(0, Math.min(1, fraction)));
}

export function calculateGameSummary(
  rounds: readonly { score: number; playTimeSeconds: number | null }[],
  storedTotalScore?: number,
) {
  const baseScore = rounds.reduce((sum, round) => sum + round.score, 0);
  const totalTimeSeconds = rounds.reduce((sum, round) => sum + (round.playTimeSeconds ?? 0), 0);
  const bonusScore = storedTotalScore === undefined
    ? calculateTimeBonus(totalTimeSeconds)
    : storedTotalScore - baseScore;
  return { baseScore, totalTimeSeconds, bonusScore, totalScore: baseScore + bonusScore };
}
