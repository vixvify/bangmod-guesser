"use client";

import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import type { DashboardPeriod } from "@/features/dashboard/dashboard";
import { AppRoutes } from "@/shared/routes/routes";

export function DashboardFilters({ period, hasDateFilter }: { period: DashboardPeriod; hasDateFilter: boolean }) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-end gap-3">
      <DateRangePicker theme="dark"
        label="ช่วงวันที่"
        defaultValue={hasDateFilter ? { startDate: period.startDate, endDate: period.endDate } : undefined}
        onChange={({ startDate, endDate }) => {
          if (!startDate || !endDate) return;
          router.push(
            `${AppRoutes.admin}?${new URLSearchParams({ startDate, endDate })}`,
          );
        }}
      />
      {hasDateFilter && (
        <Button variant="outline" size="small" onClick={() => router.push(AppRoutes.admin)}>
          ล้างตัวกรอง
        </Button>
      )}
      <Button variant="outline" size="small" onClick={() => router.refresh()}>
        <RefreshRoundedIcon fontSize="small" /> รีเฟรช
      </Button>
    </div>
  );
}
