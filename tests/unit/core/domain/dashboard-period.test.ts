import { describe, expect, it } from "vitest";
import { getDashboardPeriod, getDashboardTodayPeriod } from "@/core/domain/dashboard-period";

describe("getDashboardPeriod", () => {
  it("provides a separate one-day period for players today", () => {
    const today = getDashboardTodayPeriod(new Date("2026-10-26T18:00:00Z"));
    expect(today.output.startDate).toBe("2026-10-27");
    expect(today.output.endDate).toBe("2026-10-27");
    expect(today.output.previousStartDate).toBe("2026-10-26");
    expect(today.dates).toEqual(["2026-10-27"]);
  });
  it("defaults to thirty Bangkok calendar days including today and compares the preceding thirty", () => {
    const period = getDashboardPeriod({}, new Date("2026-10-26T18:00:00Z"));
    expect(period.output).toEqual({
      startDate: "2026-09-28", endDate: "2026-10-27", previousStartDate: "2026-08-29",
      previousEndDate: "2026-09-27", timeZone: "Asia/Bangkok",
    });
    expect(period.start.toISOString()).toBe("2026-09-27T17:00:00.000Z");
    expect(period.endExclusive.toISOString()).toBe("2026-10-27T17:00:00.000Z");
    expect(period.previousEndExclusive).toEqual(period.start);
    expect(period.dates).toHaveLength(30);
  });

  it("handles inclusive leap-day ranges and equal-length comparisons across months", () => {
    const period = getDashboardPeriod({ startDate: "2024-02-28", endDate: "2024-03-01" });
    expect(period.dates).toEqual(["2024-02-28", "2024-02-29", "2024-03-01"]);
    expect(period.output.previousStartDate).toBe("2024-02-25");
    expect(period.output.previousEndDate).toBe("2024-02-27");
    expect(period.endExclusive.getTime() - period.start.getTime()).toBe(3 * 86400000);
  });

  it("uses one whole Bangkok day for a same-date range", () => {
    const period = getDashboardPeriod({ startDate: "2026-01-01", endDate: "2026-01-01" });
    expect(period.dates).toEqual(["2026-01-01"]);
    expect(period.output.previousStartDate).toBe("2025-12-31");
    expect(period.previousStart.toISOString()).toBe("2025-12-30T17:00:00.000Z");
  });

  it("handles the inclusive end of year 9999 without truncating the exclusive boundary", () => {
    const period = getDashboardPeriod({ startDate: "9999-12-31", endDate: "9999-12-31" });
    expect(period.endExclusive.toISOString()).toBe("9999-12-31T17:00:00.000Z");
    expect(period.dates).toEqual(["9999-12-31"]);
  });

  it("preserves the entire previous-period date before year zero", () => {
    const period = getDashboardPeriod({ startDate: "0000-01-01", endDate: "0000-01-01" });
    expect(period.output.previousEndDate).toBe("-000001-12-31");
    expect(period.previousStart.toISOString()).toBe("-000001-12-30T17:00:00.000Z");
  });
});
