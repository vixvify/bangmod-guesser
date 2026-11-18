export const MAX_GAME_SCORE = 5000;

export type ScoreTier = "SSS" | "S" | "A" | "B" | "C" | "D";

export interface TierInfo {
  tier: ScoreTier;
  minScore: number;
  maxScore: number;
  badgeClassName: string;
}

export const SCORE_TIERS: Record<ScoreTier, TierInfo> = {
  SSS: {
    tier: "SSS",
    minScore: 4750,
    maxScore: 5000,
    badgeClassName: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },
  S: {
    tier: "S",
    minScore: 4200,
    maxScore: 4749,
    badgeClassName: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
  },
  A: {
    tier: "A",
    minScore: 3350,
    maxScore: 4199,
    badgeClassName: "border-purple-400/30 bg-purple-400/10 text-purple-300",
  },
  B: {
    tier: "B",
    minScore: 2500,
    maxScore: 3349,
    badgeClassName: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  },
  C: {
    tier: "C",
    minScore: 1650,
    maxScore: 2499,
    badgeClassName: "border-teal-400/30 bg-teal-400/10 text-teal-300",
  },
  D: {
    tier: "D",
    minScore: 0,
    maxScore: 1649,
    badgeClassName: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  },
};

export function calculateScoreTier(score: number): ScoreTier {
  if (typeof score !== "number" || Number.isNaN(score) || score < 1650) return "D";
  if (score >= 4750) return "SSS";
  if (score >= 4200) return "S";
  if (score >= 3350) return "A";
  if (score >= 2500) return "B";
  return "C";
}

export function getScoreTierInfo(
  tierOrScore: ScoreTier | number | null | undefined,
): TierInfo | null {
  if (tierOrScore === null || tierOrScore === undefined) return null;
  const tier = typeof tierOrScore === "number" ? calculateScoreTier(tierOrScore) : tierOrScore;
  return SCORE_TIERS[tier] ?? null;
}

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
  const bonusScore = calculateTimeBonus(totalTimeSeconds);
  const totalScore = Math.min(MAX_GAME_SCORE, storedTotalScore ?? baseScore + bonusScore);
  return { baseScore, totalTimeSeconds, bonusScore, totalScore };
}
