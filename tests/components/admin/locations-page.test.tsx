// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminPage from "@/app/admin/page";
import LocationsPage from "@/app/admin/locations/page";
import { AppRoutes } from "@/routes/app/routes";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("admin location navigation", () => {
  it("offers separate user and location management from the admin overview", () => {
    render(<AdminPage />);

    expect(screen.getByRole("link", { name: /จัดการผู้ใช้/ }).getAttribute("href")).toBe(AppRoutes.adminUsers);
    expect(screen.getByRole("link", { name: /จัดการสถานที่/ }).getAttribute("href")).toBe(AppRoutes.adminLocations);
  });

  it("shows mock locations with create and per-row edit links", () => {
    render(<LocationsPage />);

    const table = screen.getByRole("table", { name: "รายชื่อสถานที่" });
    expect(within(table).getAllByRole("row")).toHaveLength(10);
    expect(within(table).getByText("อาคารเรียนรวม 2 (CB2)")).toBeTruthy();
    expect(screen.getByRole("link", { name: "สร้างสถานที่" }).getAttribute("href")).toBe(AppRoutes.adminLocationCreate);
    expect(within(table).getByRole("link", { name: "แก้ไข อาคารเรียนรวม 2 (CB2)" }).getAttribute("href")).toBe(AppRoutes.adminLocationEdit("location-01"));
    expect(screen.getByText(/แสดง 1–9 จาก 72 สถานที่/)).toBeTruthy();
  });

  it("leaves the mock table unchanged when typing into the UI-only search", () => {
    render(<LocationsPage />);
    fireEvent.change(screen.getByRole("textbox", { name: "ค้นหาสถานที่" }), { target: { value: "CB2" } });

    expect(within(screen.getByRole("table", { name: "รายชื่อสถานที่" })).getAllByRole("row")).toHaveLength(10);
  });

  it("confirms a mock delete without removing the row", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<LocationsPage />);
    fireEvent.click(screen.getByRole("button", { name: "ลบ อาคารเรียนรวม 2 (CB2)" }));
    const modal = screen.getByRole("dialog", { name: "ลบสถานที่" });
    fireEvent.click(within(modal).getByRole("button", { name: "ยืนยัน" }));

    expect(log).toHaveBeenCalledWith("Mock location delete:", "location-01");
    expect(screen.getByRole("table", { name: "รายชื่อสถานที่" }).textContent).toContain("อาคารเรียนรวม 2 (CB2)");
  });
});
