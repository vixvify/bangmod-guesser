// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { mockUser } from "@/_mock/_profile";
import { ProfileCard } from "@/components/profile/profile-card";

afterEach(cleanup);

describe("ProfileCard", () => {
  it("lets the user edit and save a trimmed username in a dialog", async () => {
    render(<ProfileCard profile={mockUser} />);

    expect(screen.getByText("Username")).toBeTruthy();
    expect(screen.getByText("example@gmail.com")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "แก้ไขชื่อผู้ใช้" }));

    expect(screen.getByRole("dialog", { name: "แก้ไขชื่อผู้ใช้" })).toBeTruthy();
    expect(screen.getByRole("separator")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "บันทึก" }).parentElement?.classList.contains("mt-8"),
    ).toBe(true);
    expect(screen.getByText("example@gmail.com")).toBeTruthy();

    const input = screen.getByRole("textbox", { name: "ชื่อผู้ใช้" });
    expect(input.closest(".MuiOutlinedInput-root")).toBeTruthy();
    expect(input.getAttribute("maxLength")).toBe("50");
    fireEvent.change(input, { target: { value: "  Bangmod Player  " } });
    fireEvent.click(screen.getByRole("button", { name: "บันทึก" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByRole("heading", { name: "Bangmod Player" })).toBeTruthy();
    expect(screen.queryByRole("textbox", { name: "ชื่อผู้ใช้" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "แก้ไขชื่อผู้ใช้" }));
    expect(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" })).toHaveProperty(
      "value",
      "Bangmod Player",
    );
  });

  it("rejects an empty username and keeps the edit field open", () => {
    render(<ProfileCard profile={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: "แก้ไขชื่อผู้ใช้" }));
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" }), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "บันทึก" }));

    expect(screen.getByText("กรุณากรอกชื่อผู้ใช้")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" })).toBeTruthy();
  });

  it("restores the previous username when editing is cancelled with Escape", async () => {
    render(<ProfileCard profile={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: "แก้ไขชื่อผู้ใช้" }));
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" }), {
      target: { value: "Unsaved" },
    });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" }), {
      key: "Escape",
    });

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByRole("heading", { name: "Username" })).toBeTruthy();
  });

  it("shows a labeled edit form and discards changes when cancelled", async () => {
    render(<ProfileCard profile={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: "แก้ไขชื่อผู้ใช้" }));

    expect(screen.getByText("ชื่อผู้ใช้").classList.contains("sr-only")).toBe(false);
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" }), {
      target: { value: "Unsaved" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ยกเลิก" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByRole("heading", { name: "Username" })).toBeTruthy();
    expect(screen.getByText("example@gmail.com")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "แก้ไขชื่อผู้ใช้" }));
    expect(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" })).toHaveProperty(
      "value",
      "Username",
    );
  });

  it("shows the management action for an admin", () => {
    render(<ProfileCard profile={mockUser} canManageSystem />);

    expect(screen.getByRole("button", { name: "จัดการระบบ" })).toBeTruthy();
  });
});
