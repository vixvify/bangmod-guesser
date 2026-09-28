// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { mockUser } from "@/_mock/_profile";
import { ProfileCard } from "@/components/profile/profile-card";

afterEach(cleanup);

describe("ProfileCard", () => {
  it("lets the user edit and save a trimmed username in the current view", () => {
    render(<ProfileCard profile={mockUser} />);

    expect(screen.getByText("Username")).toBeTruthy();
    expect(screen.getByText("example@gmail.com")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "แก้ไขชื่อผู้ใช้" }));

    const input = screen.getByRole("textbox", { name: "ชื่อผู้ใช้" });
    fireEvent.change(input, { target: { value: "  Bangmod Player  " } });
    fireEvent.click(screen.getByRole("button", { name: "บันทึก" }));

    expect(screen.getByRole("heading", { name: "Bangmod Player" })).toBeTruthy();
    expect(screen.queryByRole("textbox", { name: "ชื่อผู้ใช้" })).toBeNull();
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

  it("restores the previous username when editing is cancelled with Escape", () => {
    render(<ProfileCard profile={mockUser} />);
    fireEvent.click(screen.getByRole("button", { name: "แก้ไขชื่อผู้ใช้" }));
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" }), {
      target: { value: "Unsaved" },
    });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" }), {
      key: "Escape",
    });

    expect(screen.getByRole("heading", { name: "Username" })).toBeTruthy();
  });

  it("shows the management action for an admin", () => {
    render(<ProfileCard profile={mockUser} canManageSystem />);

    expect(screen.getByRole("button", { name: "จัดการระบบ" })).toBeTruthy();
  });
});
