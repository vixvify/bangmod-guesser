import { describe, expect, it } from "vitest";
import { calculateScoreTier, formatScore } from "@/lib/utils";

describe("formatScore", () => {
  it("formats numbers with comma separators", () => {
    expect(formatScore(4280)).toBe("4,280");
    expect(formatScore(5000)).toBe("5,000");
    expect(formatScore(0)).toBe("0");
  });
});

describe("calculateScoreTier", () => {
  it("returns SSS tier for scores 4750 - 5000", () => {
    expect(calculateScoreTier(5000)).toBe("SSS");
    expect(calculateScoreTier(4750)).toBe("SSS");
  });

  it("returns S tier for scores 4200 - 4749", () => {
    expect(calculateScoreTier(4749)).toBe("S");
    expect(calculateScoreTier(4280)).toBe("S");
    expect(calculateScoreTier(4200)).toBe("S");
  });

  it("returns A tier for scores 3350 - 4199", () => {
    expect(calculateScoreTier(4199)).toBe("A");
    expect(calculateScoreTier(3850)).toBe("A");
    expect(calculateScoreTier(3350)).toBe("A");
  });

  it("returns B tier for scores 2500 - 3349", () => {
    expect(calculateScoreTier(3349)).toBe("B");
    expect(calculateScoreTier(2970)).toBe("B");
    expect(calculateScoreTier(2500)).toBe("B");
  });

  it("returns C tier for scores 1650 - 2499", () => {
    expect(calculateScoreTier(2499)).toBe("C");
    expect(calculateScoreTier(2000)).toBe("C");
    expect(calculateScoreTier(1650)).toBe("C");
  });

  it("returns D tier for scores 0 - 1649", () => {
    expect(calculateScoreTier(1649)).toBe("D");
    expect(calculateScoreTier(1000)).toBe("D");
    expect(calculateScoreTier(0)).toBe("D");
  });
});
