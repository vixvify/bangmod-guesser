// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import UsersPage from "@/app/admin/users/page";
import { UsersTable } from "@/components/admin/users-table";
import { mockUsers } from "@/_mock/_users";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("UsersPage", () => {
  it("shows mock users in the MUI table with controls and static pagination", () => {
    render(<UsersPage />);

    const table = screen.getByRole("table", { name: "รายชื่อผู้ใช้" });
    expect(screen.getByRole("heading", { name: "จัดการผู้ใช้" })).toBeTruthy();
    expect(within(table).getAllByRole("row")).toHaveLength(10);
    expect(within(table).getByText("vixvify_v")).toBeTruthy();
    expect(screen.getByLabelText("กรองตามบทบาท")).toBeTruthy();
    expect(screen.getByLabelText("กรองตามสถานะ")).toBeTruthy();
    expect(screen.getByText(/แสดง 1–9 จาก 372 ผู้ใช้/)).toBeTruthy();
  });

  it("keeps both filters alongside the management heading", () => {
    render(<UsersPage />);

    const headingRow = screen.getByRole("heading", { name: "จัดการผู้ใช้" })
      .parentElement?.parentElement;
    expect(headingRow?.classList.contains("items-end")).toBe(true);
    expect(headingRow?.contains(screen.getByLabelText("กรองตามบทบาท"))).toBe(true);
    expect(headingRow?.contains(screen.getByLabelText("กรองตามสถานะ"))).toBe(true);
  });

  it("uses a consistent badge style while distinguishing roles and account states", () => {
    render(<UsersPage />);

    const admin = screen.getByRole("row", { name: /vixvify_v/ });
    const player = screen.getByRole("row", { name: /ponddd/ });
    const temporarilySuspended = screen.getByRole("row", { name: /mind_mint/ });
    const suspended = screen.getByRole("row", { name: /phobrak/ });

    expect(within(admin).getByText("ผู้ดูแล").className).toContain("bg-orange-50");
    expect(within(player).getByText("ผู้เล่น").className).toContain("bg-slate-100");
    expect(within(admin).getByText("ปกติ").className).toContain("bg-emerald-50");
    expect(within(temporarilySuspended).getByText("ระงับชั่วคราว").className).toContain("bg-amber-50");
    expect(within(suspended).getByText("ระงับถาวร").className).toContain("bg-rose-50");
  });

  it("shows an inactive account with the disabled-state badge", () => {
    render(
      <UsersTable
        users={[{ ...mockUsers[0], status: "INACTIVE" }]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("ปิดใช้งาน").className).toContain("bg-slate-200");
  });

  it("keeps all mock rows visible when the UI-only filters are selected", async () => {
    render(<UsersPage />);
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "กรองตามบทบาท" }));
    fireEvent.click(await screen.findByRole("option", { name: "ผู้ดูแล" }));

    const table = screen.getByRole("table", { name: "รายชื่อผู้ใช้" });
    expect(screen.getByRole("combobox", { name: "กรองตามบทบาท" }).textContent).toContain("ผู้ดูแล");
    expect(within(table).getAllByRole("row")).toHaveLength(10);
    expect(within(table).getByText("ponddd")).toBeTruthy();

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "กรองตามสถานะ" }));
    fireEvent.click(await screen.findByRole("option", { name: "ระงับการใช้งาน" }));
    expect(screen.getByRole("combobox", { name: "กรองตามสถานะ" }).textContent).toContain("ระงับการใช้งาน");
    expect(within(table).getAllByRole("row")).toHaveLength(10);
    expect(within(table).getByText("vixvify_v")).toBeTruthy();
  });

  it("opens the edit modal with read-only email and logs valid changes without mutating the mock row", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<UsersPage />);
    fireEvent.click(screen.getByRole("button", { name: "แก้ไข vixvify_v" }));

    const modal = screen.getByRole("dialog", { name: "แก้ไขผู้ใช้" });
    const email = within(modal).getByLabelText("อีเมล");
    expect(email.hasAttribute("readonly")).toBe(true);
    expect(email.hasAttribute("disabled")).toBe(true);
    expect(within(modal).getByRole("button", { name: "บันทึก" }).hasAttribute("disabled")).toBe(true);

    fireEvent.change(within(modal).getByRole("textbox", { name: "ชื่อผู้ใช้" }), { target: { value: "New Admin" } });
    await waitFor(() => expect(within(modal).getByRole("button", { name: "บันทึก" }).hasAttribute("disabled")).toBe(false));
    fireEvent.click(within(modal).getByRole("button", { name: "บันทึก" }));

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "แก้ไขผู้ใช้" })).toBeNull());
    expect(log).toHaveBeenCalledWith("Mock user update:", expect.objectContaining({ id: "u-01", name: "New Admin" }));
    await waitFor(() =>
      expect(screen.getByRole("table", { name: "รายชื่อผู้ใช้" }).textContent).toContain("vixvify_v"),
    );
  });

  it("shows optional suspension dates and allows a permanent suspension", async () => {
    render(<UsersPage />);
    fireEvent.click(screen.getByRole("button", { name: "แก้ไข ponddd" }));
    const modal = screen.getByRole("dialog", { name: "แก้ไขผู้ใช้" });
    fireEvent.click(within(modal).getByRole("radio", { name: /ระงับการใช้งาน/ }));

    expect(within(modal).getByRole("textbox", { name: "ระยะเวลาการระงับ (ไม่บังคับ)" })).toBeTruthy();
    expect(within(modal).getByRole("textbox", { name: "เหตุผล (ไม่บังคับ)" })).toBeTruthy();
    await waitFor(() => expect(within(modal).getByRole("button", { name: "บันทึก" }).hasAttribute("disabled")).toBe(false));
  });

  it("shows the inactive option without a suspension date field", () => {
    render(<UsersPage />);
    fireEvent.click(screen.getByRole("button", { name: "แก้ไข ponddd" }));
    const modal = screen.getByRole("dialog", { name: "แก้ไขผู้ใช้" });
    fireEvent.click(within(modal).getByRole("radio", { name: /ปิดใช้งาน/ }));

    expect(within(modal).queryByRole("textbox", { name: "ระยะเวลาการระงับ (ไม่บังคับ)" })).toBeNull();
    expect(within(modal).getByRole("textbox", { name: "เหตุผล (ไม่บังคับ)" })).toBeTruthy();
  });

  it("asks for confirmation before logging a mock delete", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<UsersPage />);
    fireEvent.click(screen.getByRole("button", { name: "ลบ ponddd" }));
    const modal = screen.getByRole("dialog", { name: "ลบผู้ใช้" });
    fireEvent.click(within(modal).getByRole("button", { name: "ยืนยัน" }));

    expect(log).toHaveBeenCalledWith("Mock user delete:", "u-04");
    expect(screen.getByRole("table", { name: "รายชื่อผู้ใช้" }).textContent).toContain("ponddd");
  });
});
