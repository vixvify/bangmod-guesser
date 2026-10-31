// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminPage from "@/app/admin/page";
import { dashboardSummary } from "../../fixtures/dashboard";
import { AppRoutes } from "@/routes/app/routes";

const { getDashboard, push, refresh } = vi.hoisted(() => ({ getDashboard: vi.fn(), push: vi.fn(), refresh: vi.fn() }));
vi.mock("@/lib/dashboard", () => ({ getDashboard }));
vi.mock("@/routes/api/dashboard.routes", () => ({ DashboardRoutes: { games: "/api/dashboard/games" } }));
vi.mock("next/navigation", async (importOriginal) => ({
  ...await importOriginal<typeof import("next/navigation")>(),
  useRouter: () => ({ push, refresh }),
}));

beforeEach(() => { getDashboard.mockResolvedValue(dashboardSummary); });
afterEach(() => { cleanup(); vi.clearAllMocks(); });

async function renderDashboard(searchParams: { startDate?: string; endDate?: string } = {}) {
  await act(async () => { render(await AdminPage({ searchParams: Promise.resolve(searchParams) })); });
}

describe("admin dashboard", () => {
  it("loads real dashboard contract and composes the overview", async () => {
    await renderDashboard();
    expect(getDashboard).toHaveBeenCalledWith({ search: "", page: 1, pageSize: 10 });
    expect(screen.getByRole("heading", { name: "ภาพรวมระบบ" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "จัดการผู้ใช้" }).getAttribute("href")).toBe(AppRoutes.adminUsers);
    expect(screen.getByRole("link", { name: "จัดการสถานที่" }).getAttribute("href")).toBe(AppRoutes.adminLocations);
    expect(screen.getByRole("table", { name: "บันทึกเกมล่าสุด" })).toBeTruthy();
    expect(screen.getByRole("img", { name: /จำนวนเกมรายวัน/ })).toBeTruthy();
  });

  it("shows the selected game's actual rounds and total in a modal", async () => {
    await renderDashboard();
    fireEvent.click(screen.getByRole("button", { name: "ดูรายละเอียดเกม game-1" }));
    const modal = screen.getByRole("dialog", { name: "รายละเอียดเกม" });
    expect(within(modal).getByRole("table", { name: "คะแนนแต่ละรอบ" }).textContent).toContain("หอสมุด");
    expect(modal.textContent).toContain("3,500");
    expect(modal.textContent).toContain("ระบบยังไม่มีข้อมูลโบนัสแยกต่างหาก");
    fireEvent.click(within(modal).getByRole("button", { name: "ปิดรายละเอียดเกม" }));
    expect(screen.queryByRole("dialog", { name: "รายละเอียดเกม" })).toBeNull();
  });

  it("validates date range before requesting dashboard data", async () => {
    await expect(AdminPage({ searchParams: Promise.resolve({ startDate: "2026-10-01" }) })).rejects.toMatchObject({ status: 400 });
    expect(getDashboard).not.toHaveBeenCalled();
  });
});
