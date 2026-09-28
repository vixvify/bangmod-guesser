// @vitest-environment jsdom

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/core/domain/user";

const { signOut, routerRefresh, toastError, toastSuccess } = vi.hoisted(() => ({
  signOut: vi.fn(),
  routerRefresh: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerRefresh }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut },
}));

vi.mock("sonner", () => ({ toast: { error: toastError, success: toastSuccess } }));

import { Navbar } from "@/components/layout/navbar";

const user = {
  id: "user_1",
  name: "KMUTT Student",
  email: "student@example.com",
  role: UserRole.USER,
};

describe("Navbar logout", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    routerRefresh.mockReset();
    signOut.mockReset();
    toastError.mockReset();
    toastSuccess.mockReset();
  });

  it("opens a confirmation dialog and leaves the user signed in when cancelled", async () => {
    const { getByRole, queryByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: /ออกจากระบบ/ }));

    expect(getByRole("dialog")).toBeTruthy();
    expect(signOut).not.toHaveBeenCalled();

    fireEvent.click(getByRole("button", { name: "ยกเลิก" }));

    await waitFor(() => expect(queryByRole("dialog")).toBeNull());
    expect(signOut).not.toHaveBeenCalled();
    expect(routerRefresh).not.toHaveBeenCalled();
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("signs out and refreshes only after confirmation", async () => {
    signOut.mockResolvedValue({});
    const { getByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: /ออกจากระบบ/ }));
    expect(signOut).not.toHaveBeenCalled();
    fireEvent.click(getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledOnce();
      expect(toastSuccess).toHaveBeenCalledWith("ออกจากระบบสำเร็จ");
      expect(routerRefresh).toHaveBeenCalledOnce();
    });
    expect(toastError).not.toHaveBeenCalled();
  });

  it("keeps the dialog open and shows an error when logout fails", async () => {
    signOut.mockRejectedValue(new Error("Logout failed"));
    const { getByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: /ออกจากระบบ/ }));
    fireEvent.click(getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledOnce();
    });

    expect(getByRole("dialog")).toBeTruthy();
    expect(toastError).toHaveBeenCalledOnce();
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(routerRefresh).not.toHaveBeenCalled();
  });

  it("does not refresh when sign out returns an error response", async () => {
    signOut.mockResolvedValue({ error: { message: "Sign out failed" } });
    const { getByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: /ออกจากระบบ/ }));
    fireEvent.click(getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() => expect(toastError).toHaveBeenCalledOnce());
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(getByRole("dialog")).toBeTruthy();
    expect(routerRefresh).not.toHaveBeenCalled();
  });
});
