export type ScoreTier = "SSS" | "S" | "A" | "B" | "C" | "D";

export interface TierInfo {
  tier: ScoreTier;
  label: string;
  minScore: number;
  maxScore: number;
  percentage: string;
  description: string;
  badgeClassName: string;
}

export function formatScore(score: number): string {
  return score.toLocaleString("en-US");
}

export function calculateScoreTier(score: number): ScoreTier {
  if (score >= 4750) return "SSS";
  if (score >= 4200) return "S";
  if (score >= 3350) return "A";
  if (score >= 2500) return "B";
  if (score >= 1650) return "C";
  return "D";
}
