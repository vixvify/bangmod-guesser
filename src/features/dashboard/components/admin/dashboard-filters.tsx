"use client";

import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import type { DashboardPeriod } from "@/features/dashboard/domain/dashboard";
import { AppRoutes } from "@/shared/routes/routes";

export function DashboardFilters({ period }: { period: DashboardPeriod }) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-end gap-3">
      <DateRangePicker
        label="ช่วงวันที่"
        defaultValue={{ startDate: period.startDate, endDate: period.endDate }}
        onChange={({ startDate, endDate }) => {
          if (!startDate || !endDate) return;
          router.push(
            `${AppRoutes.admin}?${new URLSearchParams({ startDate, endDate })}`,
          );
        }}
      />
      <Button variant="surface" size="small" onClick={() => router.refresh()}>
        <RefreshRoundedIcon fontSize="small" /> รีเฟรช
      </Button>
    </div>
  );
}
