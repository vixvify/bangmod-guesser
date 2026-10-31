import {
  DASHBOARD_HIGH_ACCURACY_THRESHOLD,
  DASHBOARD_MAX_SCORE,
  DASHBOARD_SCORE_BUCKET_SIZE,
} from "@/core/constants/dashboard";
import type {
  DashboardGameCounts,
  DashboardScoreBucket,
  DashboardSummary,
} from "@/core/domain/dashboard";
import { haversineDistanceMeters } from "@/lib/calculate-distance";

export function roundDashboardNumber(value: number): number {
  return Math.round(value * 100) / 100;
}

export function dashboardChangePercent(
  current: number,
  previous: number,
): number | null {
  return previous === 0
    ? null
    : roundDashboardNumber(((current - previous) / previous) * 100);
}

export function dashboardDistance(round: {
  guessedLatitude: number | null;
  guessedLongitude: number | null;
  location: { latitude: number; longitude: number };
}): number | null {
  if (round.guessedLatitude === null || round.guessedLongitude === null)
    return null;
  return haversineDistanceMeters(round.location, {
    latitude: round.guessedLatitude,
    longitude: round.guessedLongitude,
  });
}

export function getDashboardScores(
  groups: { score: number | null; count: number }[],
): DashboardSummary["scores"] {
  const scored = groups
    .filter(
      (group): group is typeof group & { score: number } =>
        group.score !== null &&
        group.score >= 0 &&
        group.score <= DASHBOARD_MAX_SCORE,
    )
    .sort((first, second) => first.score - second.score);
  const count = scored.reduce((sum, group) => sum + group.count, 0);
  const bucketCount = DASHBOARD_MAX_SCORE / DASHBOARD_SCORE_BUCKET_SIZE + 1;
  const buckets: DashboardScoreBucket[] = Array.from(
    { length: bucketCount },
    (_, index) => ({
      min: index * DASHBOARD_SCORE_BUCKET_SIZE,
      max: Math.min(
        (index + 1) * DASHBOARD_SCORE_BUCKET_SIZE,
        DASHBOARD_MAX_SCORE,
      ),
      maxInclusive: index === bucketCount - 1,
      count: 0,
      percentage: 0,
    }),
  );
  let cumulative = 0;
  let lower = 0;
  let upper = 0;
  let scoreTotal = 0;
  let highAccuracyCount = 0;
  for (const group of scored) {
    buckets[Math.floor(group.score / DASHBOARD_SCORE_BUCKET_SIZE)].count +=
      group.count;
    scoreTotal += group.score * group.count;
    if (group.score > DASHBOARD_HIGH_ACCURACY_THRESHOLD)
      highAccuracyCount += group.count;
    const next = cumulative + group.count;
    if (
      cumulative <= Math.floor((count - 1) / 2) &&
      next > Math.floor((count - 1) / 2)
    )
      lower = group.score;
    if (cumulative <= Math.floor(count / 2) && next > Math.floor(count / 2))
      upper = group.score;
    cumulative = next;
  }
  for (const bucket of buckets) {
    bucket.percentage =
      count === 0 ? 0 : roundDashboardNumber((bucket.count / count) * 100);
  }
  const mostFrequentBucket =
    count === 0
      ? null
      : buckets.reduce((best, bucket) =>
          bucket.count > best.count ? bucket : best,
        );
  return {
    maxScore: DASHBOARD_MAX_SCORE,
    count,
    median: count === 0 ? null : (lower + upper) / 2,
    mean: count === 0 ? null : roundDashboardNumber(scoreTotal / count),
    highAccuracy: {
      threshold: DASHBOARD_HIGH_ACCURACY_THRESHOLD,
      operator: "gt",
      count: highAccuracyCount,
      percentage:
        count === 0
          ? null
          : roundDashboardNumber((highAccuracyCount / count) * 100),
    },
    buckets,
    mostFrequentBucket,
  };
}

export function getDashboardDropOff(
  current: DashboardGameCounts,
  allTime: DashboardGameCounts,
): Omit<
  DashboardSummary["dropOff"],
  "byRound" | "mostCommonRound" | "unknownRoundCount"
> {
  const ratePercent =
    current.total === 0
      ? 0
      : roundDashboardNumber((current.incomplete / current.total) * 100);
  const baselineRate =
    allTime.total === 0
      ? null
      : roundDashboardNumber((allTime.incomplete / allTime.total) * 100);
  const differencePercentagePoints =
    current.total === 0 || baselineRate === null
      ? null
      : roundDashboardNumber(ratePercent - baselineRate);
  let comparison: DashboardSummary["dropOff"]["comparison"] = "unavailable";
  if (differencePercentagePoints !== null) {
    comparison =
      differencePercentagePoints > 0
        ? "above"
        : differencePercentagePoints < 0
          ? "below"
          : "equal";
  }
  return {
    count: current.incomplete,
    ratePercent,
    comparison,
    differencePercentagePoints,
    baseline: {
      scope: "ALL_TIME",
      gameCount: allTime.total,
      incompleteCount: allTime.incomplete,
      ratePercent: baselineRate,
    },
  };
}
