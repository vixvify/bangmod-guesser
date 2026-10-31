import { describe, expect, it } from "vitest";
import { DashboardQuerySchema } from "@/core/schema/dashboard.schema";

describe("DashboardQuerySchema", () => {
  it("defaults pagination and trims search text", () => {
    expect(DashboardQuerySchema.parse({ search: " Library " })).toEqual({ search: "Library", page: 1, pageSize: 10 });
  });

  it("accepts a paired inclusive date range and numeric query strings", () => {
    expect(DashboardQuerySchema.parse({ startDate: "2026-10-01", endDate: "2026-10-27", page: "2", pageSize: "20" }))
      .toMatchObject({ startDate: "2026-10-01", endDate: "2026-10-27", page: 2, pageSize: 20 });
  });

  it.each([
    { startDate: "2026-10-01" }, { endDate: "2026-10-27" },
    { startDate: "2026-10-27", endDate: "2026-10-01" },
    { startDate: "2026-02-30", endDate: "2026-03-01" },
    { startDate: "2025-01-01", endDate: "2026-01-02" },
    { startDate: "2026-10-01T00:00:00Z", endDate: "2026-10-27" },
    { page: "0" }, { page: "1.5" }, { page: "NaN" }, { pageSize: "101" },
    { search: "x".repeat(101) },
  ])("rejects invalid or excessive query input %j", (query) => {
    expect(DashboardQuerySchema.safeParse(query).success).toBe(false);
  });
});
