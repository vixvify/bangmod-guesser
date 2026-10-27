import { describe, expect, it } from "vitest";
import { dashboardChangePercent, dashboardDistance, getDashboardDropOff, getDashboardScores } from "@/core/domain/dashboard-metrics";

describe("dashboardChangePercent", () => {
  it("reports growth, decline and an unavailable comparison when the baseline is zero", () => {
    expect(dashboardChangePercent(3, 2)).toBe(50);
    expect(dashboardChangePercent(0, 3)).toBe(-100);
    expect(dashboardChangePercent(0, 0)).toBeNull();
    expect(dashboardChangePercent(4, 0)).toBeNull();
  });
});

describe("getDashboardScores", () => {
  it("puts boundary scores into exactly one bucket and separates a perfect 5000", () => {
    const result = getDashboardScores([0, 999, 1000, 1999, 2000, 2999, 3000, 3999, 4000, 4999, 5000]
      .map((score) => ({ score, count: 1 })));
    expect(result.buckets.map((bucket) => bucket.count)).toEqual([2, 2, 2, 2, 2, 1]);
    expect(result.count).toBe(11);
    expect(result.median).toBe(2999);
    expect(result.buckets[5]).toEqual({ min: 5000, max: 5000, maxInclusive: true, count: 1, percentage: 9.09 });
    expect(result.mostFrequentBucket?.min).toBe(0);
  });

  it("calculates the weighted median of an even number of games", () => {
    const result = getDashboardScores([
      { score: 4000, count: 2 }, { score: 1000, count: 2 },
    ]);
    expect(result.median).toBe(2500);
    expect(result.buckets[1].percentage).toBe(50);
  });

  it("does not invent zero scores for missing or out-of-contract totals", () => {
    const result = getDashboardScores([
      { score: null, count: 4 }, { score: 6000, count: 2 },
      { score: -1, count: 1 },
    ]);
    expect(result.count).toBe(0);
    expect(result.median).toBeNull();
    expect(result.mostFrequentBucket).toBeNull();
    expect(result.buckets.every((bucket) => bucket.percentage === 0)).toBe(true);
    expect(result.mean).toBeNull();
    expect(result.highAccuracy.percentage).toBeNull();
  });

  it("reports weighted mean and counts only scores strictly above 4000 as high accuracy", () => {
    const result = getDashboardScores([{ score: 4000, count: 2 }, { score: 5000, count: 1 }]);
    expect(result.mean).toBe(4333.33);
    expect(result.median).toBe(4000);
    expect(result.highAccuracy).toEqual({ threshold: 4000, operator: "gt", count: 1, percentage: 33.33 });
  });
});

describe("getDashboardDropOff", () => {
  it("compares the filtered rate with the all-time weighted rate, without a fixed five-percent threshold", () => {
    const result = getDashboardDropOff({ total: 100, incomplete: 4 }, { total: 1000, incomplete: 60 });
    expect(result).toEqual({
      count: 4, ratePercent: 4, comparison: "below", differencePercentagePoints: -2,
      baseline: { scope: "ALL_TIME", gameCount: 1000, incompleteCount: 60, ratePercent: 6 },
    });
  });

  it.each([
    [8, "above", 2], [6, "equal", 0], [0, "below", -6],
  ] as const)("compares %s incomplete games against history", (incomplete, comparison, differencePercentagePoints) => {
    expect(getDashboardDropOff({ total: 100, incomplete }, { total: 1000, incomplete: 60 }))
      .toMatchObject({ comparison, differencePercentagePoints });
  });

  it("does not label an empty selected period or missing history as normal or abnormal", () => {
    expect(getDashboardDropOff({ total: 0, incomplete: 0 }, { total: 10, incomplete: 1 }))
      .toMatchObject({ comparison: "unavailable", differencePercentagePoints: null });
    expect(getDashboardDropOff({ total: 0, incomplete: 0 }, { total: 0, incomplete: 0 }).baseline.ratePercent).toBeNull();
  });
});

describe("dashboardDistance", () => {
  const location = { latitude: 13.6516, longitude: 100.4952 };
  it("uses the existing distance calculation and preserves missing guesses", () => {
    expect(dashboardDistance({ location, guessedLatitude: location.latitude, guessedLongitude: location.longitude })).toBe(0);
    expect(dashboardDistance({ location, guessedLatitude: null, guessedLongitude: null })).toBeNull();
    expect(dashboardDistance({ location, guessedLatitude: 13.651, guessedLongitude: 100.495 })).toBeCloseTo(70.13, 1);
  });
});
