import { z } from "zod";
import { DASHBOARD_DAY_MS, DASHBOARD_MAX_DAYS } from "@/core/constants/dashboard";

export const DashboardQuerySchema = z.object({
  startDate: z.iso.date().optional(),
  endDate: z.iso.date().optional(),
  search: z.string().trim().max(100).default(""),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
}).superRefine((query, context) => {
  if (Boolean(query.startDate) !== Boolean(query.endDate)) {
    context.addIssue({ code: "custom", message: "Provide both startDate and endDate" });
    return;
  }
  if (!query.startDate || !query.endDate) return;
  const days = (Date.parse(query.endDate) - Date.parse(query.startDate)) / DASHBOARD_DAY_MS + 1;
  if (days < 1 || days > DASHBOARD_MAX_DAYS) {
    context.addIssue({ code: "custom", message: `Date range must be between 1 and ${DASHBOARD_MAX_DAYS} days` });
  }
});

export type DashboardQueryInput = z.infer<typeof DashboardQuerySchema>;
