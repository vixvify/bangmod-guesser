// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { TableSkeleton } from "@/shared/components/ui/table-skeleton";
import { HistorySkeleton } from "@/features/profile/components/history-skeleton";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import ProfileLoading from "@/app/profile/loading";
import LeaderboardLoading from "@/app/leaderboard/loading";
import UsersLoading from "@/app/admin/users/loading";
import LocationsLoading from "@/app/admin/locations/loading";

afterEach(cleanup);

it.each([
  ["ประวัติ", HistorySkeleton, "กำลังโหลดประวัติการเล่น"],
  ["โปรไฟล์", ProfileLoading, "กำลังโหลดโปรไฟล์"],
  ["อันดับ", LeaderboardLoading, "กำลังโหลดอันดับผู้เล่น"],
  ["ภาพรวม", DashboardSkeleton, "กำลังโหลดภาพรวมระบบ"],
  ["ผู้ใช้", UsersLoading, "กำลังโหลดผู้ใช้"],
  ["สถานที่", LocationsLoading, "กำลังโหลดสถานที่"],
])("announces loading for %s", (_name, Component, label) => {
  render(<Component />);
  expect(screen.getByRole("status", { name: label }).getAttribute("aria-busy")).toBe("true");
});

it("announces the recent games table while it loads", () => {
  render(<TableSkeleton label="กำลังโหลดบันทึกเกม" columns={7} />);
  expect(screen.getByRole("status", { name: "กำลังโหลดบันทึกเกม" })).toBeTruthy();
});
