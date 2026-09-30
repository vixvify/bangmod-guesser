// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileCard } from "@/components/profile/profile-card";
import { UserRole, type User } from "@/core/domain/user";

const { updateUserMock, refreshMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  updateUserMock: vi.fn(),
  refreshMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({ authClient: { updateUser: updateUserMock } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: refreshMock }) }));
vi.mock("sonner", () => ({
  toast: { success: toastSuccessMock, error: toastErrorMock },
}));

const profile: User = {
  id: "user_1",
  name: "Username",
  email: "example@gmail.com",
  image: null,
  role: UserRole.USER,
};

beforeEach(() => {
  updateUserMock.mockResolvedValue({ data: { status: true }, error: null });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ProfileCard", () => {
  it("shows the Better Auth image when one is available", () => {
    render(<ProfileCard profile={{ ...profile, image: "https://example.com/avatar.jpg" }} />);

    expect(screen.getByRole("img", { name: "Username" }).getAttribute("src")).toBe(
      "https://example.com/avatar.jpg",
    );
  });

  it("loads a Google profile image through the local image cache", () => {
    render(
      <ProfileCard
        profile={{ ...profile, image: "https://lh3.googleusercontent.com/a/example=s96-c" }}
      />,
    );

    expect(screen.getByRole("img", { name: "Username" }).getAttribute("src")).toContain(
      "/_next/image?",
    );
  });

  it("shows the user's initial when no image is available", () => {
    const { container } = render(<ProfileCard profile={profile} />);

    expect(container.querySelector(".MuiAvatar-root")?.textContent).toBe("U");
    expect(container.querySelector(".MuiAvatar-root img")).toBeNull();
  });

  it("lets the user edit and save a trimmed username in a dialog", async () => {
    render(<ProfileCard profile={profile} />);

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
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "บันทึก" }).hasAttribute("disabled")).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "บันทึก" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(updateUserMock).toHaveBeenCalledWith({ name: "Bangmod Player" });
    expect(refreshMock).toHaveBeenCalledOnce();
    expect(toastSuccessMock).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { name: "Bangmod Player" })).toBeTruthy();
    expect(screen.queryByRole("textbox", { name: "ชื่อผู้ใช้" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "แก้ไขชื่อผู้ใช้" }));
    expect(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" })).toHaveProperty(
      "value",
      "Bangmod Player",
    );
  });

  it("disables save for an invalid username and enables it once valid", async () => {
    render(<ProfileCard profile={profile} />);
    fireEvent.click(screen.getByRole("button", { name: "แก้ไขชื่อผู้ใช้" }));
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" }), {
      target: { value: "   " },
    });
    await waitFor(() => expect(screen.getByText("กรุณากรอกชื่อผู้ใช้")).toBeTruthy());
    expect(screen.getByRole("button", { name: "บันทึก" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" })).toBeTruthy();
    expect(updateUserMock).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" }), {
      target: { value: "New name" },
    });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "บันทึก" }).hasAttribute("disabled")).toBe(false),
    );
  });

  it("keeps save disabled when the username is unchanged or only whitespace differs", async () => {
    render(<ProfileCard profile={profile} />);
    fireEvent.click(screen.getByRole("button", { name: "แก้ไขชื่อผู้ใช้" }));
    expect(screen.getByRole("button", { name: "บันทึก" }).hasAttribute("disabled")).toBe(true);
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" }), {
      target: { value: "Username  " },
    });
    expect(screen.getByRole("button", { name: "บันทึก" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "ยกเลิก" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(updateUserMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("keeps the old username and dialog open when Better Auth rejects the update", async () => {
    updateUserMock.mockResolvedValueOnce({ data: null, error: { message: "Failed" } });
    render(<ProfileCard profile={profile} />);
    fireEvent.click(screen.getByRole("button", { name: "แก้ไขชื่อผู้ใช้" }));
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" }), {
      target: { value: "New name" },
    });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "บันทึก" }).hasAttribute("disabled")).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "บันทึก" }));

    await waitFor(() => expect(toastErrorMock).toHaveBeenCalledOnce());
    expect(screen.getByRole("dialog", { name: "แก้ไขชื่อผู้ใช้" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Username", hidden: true })).toBeTruthy();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("keeps the dialog open when the request fails to reach Better Auth", async () => {
    updateUserMock.mockRejectedValueOnce(new Error("Network unavailable"));
    render(<ProfileCard profile={profile} />);
    fireEvent.click(screen.getByRole("button", { name: "แก้ไขชื่อผู้ใช้" }));
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" }), {
      target: { value: "New name" },
    });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "บันทึก" }).hasAttribute("disabled")).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "บันทึก" }));

    await waitFor(() => expect(toastErrorMock).toHaveBeenCalledOnce());
    expect(screen.getByRole("dialog", { name: "แก้ไขชื่อผู้ใช้" })).toBeTruthy();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("does not submit the name twice while the update is in progress", async () => {
    const pendingUpdate = Promise.withResolvers<{ data: { status: boolean }; error: null }>();
    updateUserMock.mockReturnValueOnce(pendingUpdate.promise);
    render(<ProfileCard profile={profile} />);
    fireEvent.click(screen.getByRole("button", { name: "แก้ไขชื่อผู้ใช้" }));
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อผู้ใช้" }), {
      target: { value: "New name" },
    });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "บันทึก" }).hasAttribute("disabled")).toBe(false),
    );
    fireEvent.click(screen.getByRole("button", { name: "บันทึก" }));

    expect(screen.getByRole("button", { name: "กำลังบันทึก..." }).hasAttribute("disabled")).toBe(
      true,
    );
    expect(screen.getByRole("button", { name: "ยกเลิก" }).hasAttribute("disabled")).toBe(true);
    await waitFor(() => expect(updateUserMock).toHaveBeenCalledOnce());

    pendingUpdate.resolve({ data: { status: true }, error: null });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("restores the previous username when editing is cancelled with Escape", async () => {
    render(<ProfileCard profile={profile} />);
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
    render(<ProfileCard profile={profile} />);
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
    render(<ProfileCard profile={profile} canManageSystem />);

    expect(screen.getByRole("button", { name: "จัดการระบบ" })).toBeTruthy();
  });
});
