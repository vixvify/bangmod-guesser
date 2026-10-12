// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockUsers } from "@/_mock/_users";
import UsersPage from "@/app/admin/users/page";
import { USER_MESSAGES } from "@/core/constants/user";
import { AppRoutes } from "@/routes/app/routes";

const { getUsers, list, patch, remove, push, refresh, success, error } = vi.hoisted(() => ({
  getUsers: vi.fn(), list: vi.fn(), patch: vi.fn(), remove: vi.fn(),
  push: vi.fn(), refresh: vi.fn(), success: vi.fn(), error: vi.fn(),
}));

vi.mock("@/infrastructure/container", () => ({ userService: { getUsers } }));
vi.mock("@/lib/http", () => ({ default: { get: list, patch, delete: remove } }));
vi.mock("@/routes/api/user.routes", () => ({
  UserRoutes: {
    list: "/api/users",
    update: (id: string) => `/api/users/${id}`,
    delete: (id: string) => `/api/users/${id}`,
  },
}));
vi.mock("sonner", () => ({ toast: { success, error } }));
vi.mock("next/navigation", async (importOriginal) => ({
  ...await importOriginal<typeof import("next/navigation")>(),
  useRouter: () => ({ push, refresh }),
}));

const firstPage = { users: mockUsers, total: 372, page: 1, limit: 9 };

beforeEach(() => {
  getUsers.mockResolvedValue(firstPage);
  list.mockResolvedValue({ data: { ...firstPage, users: [mockUsers[0]], total: 1 } });
  patch.mockResolvedValue({ data: { ...mockUsers[0], name: "New Admin" } });
  remove.mockResolvedValue({ data: null });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

async function renderUsers(searchParams: { page?: string; role?: string; status?: string } = {}) {
  await act(async () => {
    render(await UsersPage({ searchParams: Promise.resolve(searchParams) }));
  });
}

describe("admin users", () => {
  it("renders users from the server service and passes query filters", async () => {
    await renderUsers({ page: "2", role: "ADMIN" });

    expect(getUsers).toHaveBeenCalledWith({ page: 2, limit: 9, role: "ADMIN" });
    expect(screen.getByRole("table", { name: "รายชื่อผู้ใช้" }).textContent).toContain("vixvify_v");
    expect(screen.getByRole("button", { name: "แก้ไข vixvify_v" })).toBeTruthy();
  });

  it("filters the results over HTTP without navigating away", async () => {
    await renderUsers();
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "กรองตามบทบาท" }));
    fireEvent.click(await screen.findByRole("option", { name: "ผู้ดูแล" }));

    await waitFor(() => expect(list).toHaveBeenCalledWith("/api/users?role=ADMIN"));
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("table", { name: "รายชื่อผู้ใช้" }).textContent).toContain("vixvify_v");
    expect(screen.getByRole("table", { name: "รายชื่อผู้ใช้" }).textContent).not.toContain("ponddd");
  });

  it("shows the reusable empty state when no users are returned", async () => {
    getUsers.mockResolvedValueOnce({ users: [], total: 0, page: 1, limit: 9 });
    await renderUsers();

    expect(screen.getByRole("status").textContent).toContain(USER_MESSAGES.empty);
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("asks before discarding edited values from the cancel button", async () => {
    await renderUsers();
    fireEvent.click(screen.getByRole("button", { name: "แก้ไข vixvify_v" }));
    const modal = screen.getByRole("dialog", { name: "แก้ไขผู้ใช้" });
    fireEvent.change(within(modal).getByRole("textbox", { name: "ชื่อผู้ใช้" }), { target: { value: "New Admin" } });
    await waitFor(() => expect(within(modal).getByRole("button", { name: "บันทึก" }).hasAttribute("disabled")).toBe(false));
    fireEvent.click(within(modal).getByRole("button", { name: "ยกเลิก" }));

    const confirmation = screen.getByRole("dialog", { name: USER_MESSAGES.discardConfirm.title });
    fireEvent.click(within(confirmation).getByRole("button", { name: USER_MESSAGES.discardConfirm.cancel }));
    expect((within(modal).getByRole("textbox", { name: "ชื่อผู้ใช้" }) as HTMLInputElement).value).toBe("New Admin");

    fireEvent.click(within(modal).getByRole("button", { name: "ยกเลิก" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: USER_MESSAGES.discardConfirm.title })).getByRole("button", { name: USER_MESSAGES.discardConfirm.confirm }));
    expect(screen.queryByRole("dialog", { name: "แก้ไขผู้ใช้" })).toBeNull();
  });

  it("asks before discarding edited values from the backdrop", async () => {
    await renderUsers();
    fireEvent.click(screen.getByRole("button", { name: "แก้ไข vixvify_v" }));
    const modal = screen.getByRole("dialog", { name: "แก้ไขผู้ใช้" });
    fireEvent.change(within(modal).getByRole("textbox", { name: "ชื่อผู้ใช้" }), { target: { value: "New Admin" } });
    await waitFor(() => expect(within(modal).getByRole("button", { name: "บันทึก" }).hasAttribute("disabled")).toBe(false));
    const backdrop = document.querySelector(".MuiBackdrop-root");
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(screen.getByRole("dialog", { name: USER_MESSAGES.discardConfirm.title })).toBeTruthy();
  });

  it("confirms before PATCH and updates the visible row", async () => {
    await renderUsers();
    fireEvent.click(screen.getByRole("button", { name: "แก้ไข vixvify_v" }));
    const modal = screen.getByRole("dialog", { name: "แก้ไขผู้ใช้" });
    fireEvent.change(within(modal).getByRole("textbox", { name: "ชื่อผู้ใช้" }), { target: { value: "New Admin" } });
    await waitFor(() => expect(within(modal).getByRole("button", { name: "บันทึก" }).hasAttribute("disabled")).toBe(false));
    fireEvent.click(within(modal).getByRole("button", { name: "บันทึก" }));
    const confirmation = await screen.findByRole("dialog", { name: USER_MESSAGES.updateConfirm.title });
    fireEvent.click(within(confirmation).getByRole("button", { name: USER_MESSAGES.updateConfirm.confirm }));

    await waitFor(() => expect(patch).toHaveBeenCalledWith("/api/users/u-01", expect.objectContaining({ name: "New Admin" })));
    await waitFor(() => expect(screen.getByRole("table", { name: "รายชื่อผู้ใช้" }).textContent).toContain("New Admin"));
    expect(success).toHaveBeenCalledWith(USER_MESSAGES.updateSuccess);
    expect(refresh).toHaveBeenCalled();
  });

  it("keeps the modal open when the PATCH fails", async () => {
    patch.mockRejectedValueOnce(new Error("failure"));
    await renderUsers();
    fireEvent.click(screen.getByRole("button", { name: "แก้ไข vixvify_v" }));
    const modal = screen.getByRole("dialog", { name: "แก้ไขผู้ใช้" });
    fireEvent.change(within(modal).getByRole("textbox", { name: "ชื่อผู้ใช้" }), { target: { value: "New Admin" } });
    await waitFor(() => expect(within(modal).getByRole("button", { name: "บันทึก" }).hasAttribute("disabled")).toBe(false));
    fireEvent.click(within(modal).getByRole("button", { name: "บันทึก" }));
    fireEvent.click(within(await screen.findByRole("dialog", { name: USER_MESSAGES.updateConfirm.title })).getByRole("button", { name: USER_MESSAGES.updateConfirm.confirm }));
    await waitFor(() => expect(error).toHaveBeenCalledWith(USER_MESSAGES.updateFailed));
    expect(screen.getByRole("dialog", { name: "แก้ไขผู้ใช้" })).toBeTruthy();
  });

  it("deletes only after confirmation", async () => {
    await renderUsers();
    fireEvent.click(screen.getByRole("button", { name: "ลบ ponddd" }));
    const confirmation = screen.getByRole("dialog", { name: USER_MESSAGES.delete.title });
    fireEvent.click(within(confirmation).getByRole("button", { name: USER_MESSAGES.delete.confirm }));

    await waitFor(() => expect(remove).toHaveBeenCalledWith("/api/users/u-04"));
    expect(refresh).toHaveBeenCalled();
  });

  it("navigates to the requested page", async () => {
    await renderUsers();
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));
    expect(push).toHaveBeenCalledWith(`${AppRoutes.adminUsers}?page=2`, { scroll: false });
  });
});
