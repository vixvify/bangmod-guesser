"use client";

import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { DashboardPeriod } from "@/core/domain/dashboard";
import { AppRoutes } from "@/routes/app/routes";

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
