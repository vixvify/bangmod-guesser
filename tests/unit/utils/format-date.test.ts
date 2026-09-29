import { describe, expect, it } from "vitest";
import { formatThaiDateRange, formatThaiDateTime } from "@/utils/format-date";

describe("formatThaiDateTime", () => {
  it("formats ISO date string into readable Thai datetime string", () => {
    const formatted = formatThaiDateTime("2026-09-28T14:30:00");
    expect(formatted).toBe("28 ก.ย. 2026, 14:30 น.");
  });

  it("handles invalid date gracefully", () => {
    expect(formatThaiDateTime("invalid-date")).toBe("");
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
