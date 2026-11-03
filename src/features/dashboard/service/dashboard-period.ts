import {
  DASHBOARD_DAY_MS,
  DASHBOARD_DEFAULT_DAYS,
  DASHBOARD_TIME_ZONE,
} from "@/features/dashboard/constants/dashboard";
import type { DashboardQueryInput } from "@/features/dashboard/schema/dashboard.schema";
import { formatDateOnly, shiftDateOnly, toBangkokStartOfDay } from "@/shared/lib/utils";

export function getDashboardTodayPeriod(now = new Date()) {
  const today = formatDateOnly(now, DASHBOARD_TIME_ZONE);
  return getDashboardPeriod({ startDate: today, endDate: today }, now);
}

export function getDashboardPeriod(
  query: Pick<DashboardQueryInput, "startDate" | "endDate">,
  now = new Date(),
) {
  const today = formatDateOnly(now, DASHBOARD_TIME_ZONE);
  const endDate = query.endDate ?? today;
  const startDate =
    query.startDate ?? shiftDateOnly(endDate, 1 - DASHBOARD_DEFAULT_DAYS);
  const days =
    (Date.parse(endDate) - Date.parse(startDate)) / DASHBOARD_DAY_MS + 1;
  const start = toBangkokStartOfDay(startDate);
  const endExclusive = toBangkokStartOfDay(shiftDateOnly(endDate, 1));
  const previousStartDate = shiftDateOnly(startDate, -days);
  const previousEndDate = shiftDateOnly(startDate, -1);

  return {
    start,
    endExclusive,
    previousStart: toBangkokStartOfDay(previousStartDate),
    previousEndExclusive: start,
    dates: Array.from({ length: days }, (_, index) =>
      shiftDateOnly(startDate, index),
    ),
    output: {
      startDate,
      endDate,
      previousStartDate,
      previousEndDate,
      timeZone: DASHBOARD_TIME_ZONE,
    },
  };
}
