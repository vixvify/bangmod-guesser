import { describe, expect, it } from "vitest";
import { calculateDistanceMeters, calculateRoundScore, calculateTimeBonus, calculateGameSummary } from "@/features/game/game-scoring";

describe("game scoring", () => {
  it("computes Haversine distance in metres and handles coincident and antipodal points", () => {
    expect(calculateDistanceMeters(13.65, 100.49, 13.65, 100.49)).toBe(0);
    expect(calculateDistanceMeters(0, 0, 0, 1)).toBeCloseTo(111194.93, 2);
    expect(calculateDistanceMeters(0, 0, 0, 180)).toBeCloseTo(Math.PI * 6371000, 2);
  });
  it("decays continuously with distance and gives 700 points at 25 metres", () => {
    expect(calculateRoundScore(0)).toBe(1000);
    expect(calculateRoundScore(25)).toBe(700);
    expect(calculateRoundScore(5)).toBeGreaterThan(calculateRoundScore(7));
    expect(calculateRoundScore(100000)).toBe(0);
    const scores = Array.from({ length: 1000 }, (_, d) => calculateRoundScore(d));
    expect(scores.every((score, i) => score >= 0 && score <= 1000 && (i === 0 || score <= scores[i-1]))).toBe(true);
  });
  it("caps the time bonus and reduces it linearly after 120 seconds", () => {
    expect(calculateTimeBonus(0)).toBe(500);
    expect(calculateTimeBonus(120)).toBe(500);
    expect(calculateTimeBonus(210)).toBe(250);
    expect(calculateTimeBonus(300)).toBe(0);
    expect(calculateTimeBonus(1000)).toBe(0);
  });
  it("uses active round times rather than the wall clock game duration", () => {
    expect(calculateGameSummary(Array.from({length: 5}, () => ({score: 800, playTimeSeconds: 24})))).toEqual({baseScore: 4000, totalTimeSeconds: 120, bonusScore: 500, totalScore: 4500});
  });
});
