import { describe, expect, it } from "vitest";
import { formatDateOnly, formatThaiCalendarDate, formatThaiClockTime, formatThaiDateRange, formatThaiDateTime, formatThaiNumericDate, formatTime, formatTimeForSpeech, shiftDateOnly, toBangkokStartOfDay } from "@/shared/lib/utils";

describe("formatThaiDateTime", () => {
  it("uses Bangkok time across UTC midnight for consistent server and browser rendering", () => {
    expect(formatThaiDateTime("2026-09-28T17:30:00.000Z"))
      .toBe("29 ก.ย. 2026, 00:30 น.");
  });

  it("formats ISO date string into readable Thai datetime string", () => {
    const formatted = formatThaiDateTime("2026-09-28T07:30:00.000Z");
    expect(formatted).toBe("28 ก.ย. 2026, 14:30 น.");
  });

  it("handles invalid date gracefully", () => {
    expect(formatThaiDateTime("invalid-date")).toBe("");
  });
});

describe("shared date formatting", () => {
  it("formats a calendar date without shifting it across time zones", () => {
    expect(formatThaiCalendarDate("2026-09-28")).toBe("28 กันยายน 2026");
    expect(formatThaiCalendarDate("2026-09-28", "short")).toBe("28 ก.ย. 2026");
  });

  it("formats dashboard clock and date in Bangkok time", () => {
    const instant = "2026-09-28T17:30:05.000Z";
    expect(formatThaiClockTime(instant)).toBe("00:30:05");
    expect(formatThaiNumericDate(instant)).toBe("29/09/69");
    expect(formatDateOnly(instant, "Asia/Bangkok")).toBe("2026-09-29");
    expect(formatDateOnly(instant)).toBe("2026-09-28");
  });

  it("rejects invalid calendar dates", () => {
    expect(formatThaiCalendarDate("2026-02-30")).toBe("");
  });

  it("uses the same Bangkok day boundary for profile and dashboard queries", () => {
    expect(toBangkokStartOfDay("2026-09-29").toISOString()).toBe("2026-09-28T17:00:00.000Z");
    expect(shiftDateOnly("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("formats both visual and spoken durations from seconds", () => {
    expect(formatTime(85)).toBe("01:25");
    expect(formatTimeForSpeech(85)).toBe("1 นาที 25 วินาที");
  });
});

describe("formatThaiDateRange", () => {
  it("formats date range into readable Thai range string", () => {
    const formatted = formatThaiDateRange(
      "2026-09-02T00:00:00",
      "2026-09-04T00:00:00",
    );
    expect(formatted).toBe("2 กันยายน 2026 - 4 กันยายน 2026");
  });

  it("handles invalid date range gracefully", () => {
    expect(formatThaiDateRange("invalid", "invalid")).toBe("");
  });
});
