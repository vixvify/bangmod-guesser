// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockLocations } from "@/_mock/_locations";
import AdminPage from "@/app/admin/page";
import LocationsPage from "@/app/admin/locations/page";
import { AppRoutes } from "@/routes/app/routes";

const { getLocations, remove, push, refresh, success, error } = vi.hoisted(() => ({
  getLocations: vi.fn(),
  remove: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/infrastructure/container", () => ({ locationService: { getLocations } }));
vi.mock("@/lib/http", () => ({ default: { delete: remove } }));
vi.mock("sonner", () => ({ toast: { success, error } }));
vi.mock("next/navigation", async (importOriginal) => ({
  ...await importOriginal<typeof import("next/navigation")>(),
  useRouter: () => ({ push, refresh }),
}));
vi.mock("@/routes/api/location.routes", () => ({
  LocationRoutes: { delete: (id: string) => `/api/locations/${id}` },
}));

beforeEach(() => {
  getLocations.mockResolvedValue({
    items: mockLocations,
    total: 72,
    page: 1,
    pageSize: 9,
    totalPages: 8,
  });
  remove.mockResolvedValue({ data: null });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function renderLocations(searchParams: { search?: string; page?: string } = {}) {
  render(await LocationsPage({ searchParams: Promise.resolve(searchParams) }));
}

describe("admin location navigation", () => {
  it("offers separate user and location management from the admin overview", () => {
    render(<AdminPage />);

    expect(screen.getByRole("link", { name: /จัดการผู้ใช้/ }).getAttribute("href")).toBe(AppRoutes.adminUsers);
    expect(screen.getByRole("link", { name: /จัดการสถานที่/ }).getAttribute("href")).toBe(AppRoutes.adminLocations);
  });

  it("renders locations returned by the service with create and edit links", async () => {
    await renderLocations();

    const table = screen.getByRole("table", { name: "รายชื่อสถานที่" });
    expect(within(table).getAllByRole("row")).toHaveLength(10);
    expect(getLocations).toHaveBeenCalledWith({
      search: undefined,
      searchBy: "name",
      page: 1,
      pageSize: 10,
      orderBy: "desc",
    });
    expect(within(table).getByText("อาคารเรียนรวม 2 (CB2)")).toBeTruthy();
    expect(screen.getByRole("link", { name: "สร้างสถานที่" }).getAttribute("href")).toBe(AppRoutes.adminLocationCreate);
    expect(within(table).getByRole("link", { name: "แก้ไข อาคารเรียนรวม 2 (CB2)" }).getAttribute("href")).toBe(AppRoutes.adminLocationEdit("location-01"));
    expect(screen.getByText(/แสดง 1–9 จาก 72 สถานที่/)).toBeTruthy();
  });

  it("shows a reusable empty state instead of an empty table and pagination", async () => {
    getLocations.mockResolvedValueOnce({
      items: [], total: 0, page: 1, pageSize: 10, totalPages: 0,
    });

    await renderLocations();

    expect(screen.getByRole("status").textContent).toContain("ไม่พบสถานที่");
    expect(screen.getByRole("status").textContent).toContain("ยังไม่มีสถานที่ในระบบ");
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("navigation", { name: "หน้ารายการสถานที่" })).toBeNull();
  });

  it("keeps the search toolbar roomy and responsive when the list is empty", async () => {
    getLocations.mockResolvedValueOnce({
      items: [], total: 0, page: 1, pageSize: 10, totalPages: 0,
    });

    await renderLocations();

    const search = screen.getByRole("textbox", { name: "ค้นหาสถานที่" }) as HTMLInputElement;
    const form = search.closest("form");
    expect(search.placeholder).toBe("เช่น CB2, หอสมุด");
    expect(form?.className).toContain("w-full min-w-0");
    expect(form?.parentElement?.className).toContain("flex-col");
    expect(form?.parentElement?.className).toContain("sm:flex-row");
    expect(screen.getByRole("link", { name: "สร้างสถานที่" })).toBeTruthy();
  });

  it("offers a way to clear search when no locations match", async () => {
    getLocations.mockResolvedValueOnce({
      items: [], total: 0, page: 1, pageSize: 10, totalPages: 0,
    });

    await renderLocations({ search: "missing" });

    expect(screen.getByRole("status").textContent).toContain("ไม่พบสถานที่");
    expect(screen.getByRole("link", { name: "ล้างการค้นหา" }).getAttribute("href"))
      .toBe(AppRoutes.adminLocations);
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("passes search and page parameters to the service", async () => {
    await renderLocations({ search: "CB2", page: "2" });

    expect(getLocations).toHaveBeenCalledWith(expect.objectContaining({ search: "CB2", page: 2 }));
    expect((screen.getByRole("textbox", { name: "ค้นหาสถานที่" }) as HTMLInputElement).value).toBe("CB2");
  });

  it("rejects invalid query parameters instead of silently using defaults", async () => {
    await expect(LocationsPage({ searchParams: Promise.resolve({ page: "invalid" }) }))
      .rejects.toMatchObject({ status: 400 });
    expect(getLocations).not.toHaveBeenCalled();
  });

  it("navigates pagination while preserving the search", async () => {
    await renderLocations({ search: "CB2" });
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));

    expect(push).toHaveBeenCalledWith("/admin/locations?page=2&search=CB2");
  });

  it("confirms deletion through the API and refreshes the server list", async () => {
    await renderLocations();
    fireEvent.click(screen.getByRole("button", { name: "ลบ อาคารเรียนรวม 2 (CB2)" }));
    const modal = screen.getByRole("dialog", { name: "ลบสถานที่" });
    fireEvent.click(within(modal).getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() => expect(remove).toHaveBeenCalledWith("/api/locations/location-01"));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(success).toHaveBeenCalled();
  });

  it("keeps the delete dialog open when the API fails", async () => {
    remove.mockRejectedValueOnce(new Error("offline"));
    await renderLocations();
    fireEvent.click(screen.getByRole("button", { name: "ลบ อาคารเรียนรวม 2 (CB2)" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "ลบสถานที่" })).getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(screen.getByRole("dialog", { name: "ลบสถานที่" })).toBeTruthy();
  });
});
