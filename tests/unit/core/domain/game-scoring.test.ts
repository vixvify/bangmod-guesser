import { describe, expect, it } from "vitest";
import { calculateRoundScore, calculateTimeBonus, calculateGameSummary } from "@/features/game/lib/game-scoring";

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

  it("preserves a stored historical total after a formula change", () => {
    const rounds = Array.from({ length: 5 }, () => ({ score: 800, playTimeSeconds: 24 }));
    expect(calculateGameSummary(rounds, 4500)).toEqual({ baseScore: 4000, totalTimeSeconds: 120, bonusScore: 500, totalScore: 4500 });
  });
});
