import { describe, expect, it } from "vitest";
import { calculateRoundScore, calculateTimeBonus, calculateGameSummary } from "@/shared/lib/game-scoring";

describe("game scoring", () => {
  it.each([
    [0, 1000], [5, 989], [10, 953], [15, 889], [20, 803],
    [25, 700], [30, 589], [35, 477], [40, 371], [45, 278],
    [50, 200], [60, 91], [75, 21], [100, 1], [150, 0],
  ])("gives %s metres exactly %s points from the approved table", (distance, score) => {
    expect(calculateRoundScore(distance)).toBe(score);
  });

  it.each([
    [0, 300], [10, 300], [20, 284], [30, 268], [60, 221],
    [100, 158], [150, 79], [180, 32], [190, 16], [200, 0], [300, 0],
  ])("gives %s seconds exactly %s bonus points", (seconds, bonus) => {
    expect(calculateTimeBonus(seconds)).toBe(bonus);
  });

  it("keeps scores bounded and decreases continuously before integer rounding", () => {
    expect(calculateRoundScore(-1)).toBe(1000);
    expect(calculateTimeBonus(-1)).toBe(300);
    const scores = Array.from({ length: 1000 }, (_, distance) => calculateRoundScore(distance));
    expect(scores.every((score, index) => score >= 0 && score <= 1000 && (index === 0 || score <= scores[index - 1]))).toBe(true);
  });

  it("calculates one time bonus from the five active round times", () => {
    const rounds = Array.from({ length: 5 }, () => ({ score: 800, playTimeSeconds: 24 }));
    expect(calculateGameSummary(rounds)).toEqual({ baseScore: 4000, totalTimeSeconds: 120, bonusScore: 126, totalScore: 4126 });
  });

  it("preserves a stored total while calculating the bonus from saved time", () => {
    const rounds = Array.from({ length: 5 }, () => ({ score: 800, playTimeSeconds: 24 }));
    expect(calculateGameSummary(rounds, 4500)).toEqual({ baseScore: 4000, totalTimeSeconds: 120, bonusScore: 126, totalScore: 4500 });
  });
  it.each([960, 1000])("caps the final total at 5000 when each round earns %s distance points", (score) => {
    const rounds = Array.from({ length: 5 }, () => ({ score, playTimeSeconds: 0 }));
    expect(calculateGameSummary(rounds).totalScore).toBe(5000);
  });

  it("adds one 120-point bonus to five 800-point rounds", () => {
    const rounds = [24, 25, 25, 25, 25].map((playTimeSeconds) => ({ score: 800, playTimeSeconds }));
    expect(calculateGameSummary(rounds)).toEqual({ baseScore: 4000, totalTimeSeconds: 124, bonusScore: 120, totalScore: 4120 });
  });

  it("reports the earned bonus separately when a perfect game reaches the cap", () => {
    const rounds = [24, 25, 25, 25, 25].map((playTimeSeconds) => ({ score: 1000, playTimeSeconds }));
    const summary = { baseScore: 5000, totalTimeSeconds: 124, bonusScore: 120, totalScore: 5000 };
    expect(calculateGameSummary(rounds)).toEqual(summary);
    expect(calculateGameSummary(rounds, 5000)).toEqual(summary);
  });

  it("keeps the full earned bonus visible when only part fits below 5000", () => {
    const rounds = Array.from({ length: 5 }, () => ({ score: 980, playTimeSeconds: 0 }));
    expect(calculateGameSummary(rounds, 5000)).toEqual({ baseScore: 4900, totalTimeSeconds: 0, bonusScore: 300, totalScore: 5000 });
  });

});
