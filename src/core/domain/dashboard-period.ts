import {
  DASHBOARD_DAY_MS,
  DASHBOARD_DEFAULT_DAYS,
  DASHBOARD_TIME_ZONE,
  DASHBOARD_UTC_OFFSET,
} from "@/core/constants/dashboard";
import type { DashboardQueryInput } from "@/core/schema/dashboard.schema";

function shiftDate(date: string, days: number): string {
  return new Date(Date.parse(date) + days * DASHBOARD_DAY_MS).toISOString().split("T")[0];
}

function todayDate(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DASHBOARD_TIME_ZONE,
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}

export function getDashboardTodayPeriod(now = new Date()) {
  const today = todayDate(now);
  return getDashboardPeriod({ startDate: today, endDate: today }, now);
}

export function getDashboardPeriod(
  query: Pick<DashboardQueryInput, "startDate" | "endDate">,
  now = new Date(),
) {
  const today = todayDate(now);
  const endDate = query.endDate ?? today;
  const startDate = query.startDate ?? shiftDate(endDate, 1 - DASHBOARD_DEFAULT_DAYS);
  const days = (Date.parse(endDate) - Date.parse(startDate)) / DASHBOARD_DAY_MS + 1;
  const start = new Date(`${startDate}T00:00:00${DASHBOARD_UTC_OFFSET}`);
  const endExclusive = new Date(`${shiftDate(endDate, 1)}T00:00:00${DASHBOARD_UTC_OFFSET}`);
  const previousStartDate = shiftDate(startDate, -days);
  const previousEndDate = shiftDate(startDate, -1);

  return {
    start, endExclusive,
    previousStart: new Date(`${previousStartDate}T00:00:00${DASHBOARD_UTC_OFFSET}`),
    previousEndExclusive: start,
    dates: Array.from({ length: days }, (_, index) => shiftDate(startDate, index)),
    output: { startDate, endDate, previousStartDate, previousEndDate, timeZone: DASHBOARD_TIME_ZONE },
  };
}
