// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminPage from "@/app/admin/page";
import { dashboardSummary } from "../../fixtures/dashboard";
import { AppRoutes } from "@/shared/routes/routes";

const { getDashboard, getGames, push, refresh } = vi.hoisted(() => ({ getDashboard: vi.fn(), getGames: vi.fn(), push: vi.fn(), refresh: vi.fn() }));
vi.mock("@/container", () => ({ dashboardService: { getDashboard } }));
vi.mock("@/shared/lib/http", () => ({ default: { get: getGames } }));
vi.mock("@/features/dashboard/dashboard.routes", () => ({ DashboardRoutes: { games: "/api/dashboard/games" } }));
vi.mock("next/navigation", async (importOriginal) => ({
  ...await importOriginal<typeof import("next/navigation")>(),
  useRouter: () => ({ push, refresh }),
}));

beforeEach(() => { getDashboard.mockResolvedValue(dashboardSummary); getGames.mockResolvedValue({ data: dashboardSummary.games }); });
afterEach(() => { cleanup(); vi.clearAllMocks(); });

async function renderDashboard(searchParams: { startDate?: string; endDate?: string } = {}) {
  await act(async () => { render(await AdminPage({ searchParams: Promise.resolve(searchParams) })); });
}

describe("admin dashboard", () => {
  it("loads real dashboard contract and composes the overview", async () => {
    await renderDashboard();
    expect(getDashboard).toHaveBeenCalledWith({ search: "", page: 1, pageSize: 5 });
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
    expect(modal.textContent).toContain("ไม่มีข้อมูลเวลาครบสำหรับคำนวณโบนัส");
    fireEvent.click(within(modal).getByRole("button", { name: "ปิดรายละเอียดเกม" }));
    expect(screen.queryByRole("dialog", { name: "รายละเอียดเกม" })).toBeNull();
  });

  it("displays the bonus and total in separate cards", async () => {
    const [game] = dashboardSummary.games.items;
    getDashboard.mockResolvedValueOnce({
      ...dashboardSummary,
      games: { ...dashboardSummary.games, items: [{ ...game, bonusScore: 200 }] },
    });
    await renderDashboard();
    fireEvent.click(screen.getByRole("button", { name: "ดูรายละเอียดเกม game-1" }));
    const modal = screen.getByRole("dialog", { name: "รายละเอียดเกม" });
    expect(within(modal).getByText("+200")).toBeTruthy();
    expect(within(modal).getByText("3,500")).toBeTruthy();
  });

  it("validates date range before requesting dashboard data", async () => {
    await expect(AdminPage({ searchParams: Promise.resolve({ startDate: "2026-10-01" }) })).rejects.toMatchObject({ status: 400 });
    expect(getDashboard).not.toHaveBeenCalled();
  });

  it("searches recent games through the dashboard API without reloading the page", async () => {
    await renderDashboard();
    fireEvent.change(screen.getByRole("textbox", { name: "ค้นหาเกมหรือผู้เล่น" }), { target: { value: "Player" } });
    await waitFor(() => expect(getGames).toHaveBeenCalledWith(
      "/api/dashboard/games?startDate=2026-10-01&endDate=2026-10-30&page=1&pageSize=5&search=Player",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    ));
    expect(push).not.toHaveBeenCalled();
  });

  it("shows an empty state when there are no recent games", async () => {
    getDashboard.mockResolvedValueOnce({ ...dashboardSummary, games: { ...dashboardSummary.games, items: [], total: 0 } });
    await renderDashboard();
    expect(screen.getByRole("status").textContent).toContain("ไม่พบเกมในช่วงที่เลือก");
    expect(screen.queryByRole("table", { name: "บันทึกเกมล่าสุด" })).toBeNull();
  });
});
