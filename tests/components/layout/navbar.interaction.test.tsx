// @vitest-environment jsdom

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/core/domain/user";

const { signOut, routerRefresh } = vi.hoisted(() => ({
  signOut: vi.fn(),
  routerRefresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerRefresh }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut },
}));

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
  });

  it("calls authClient.signOut and refreshes the page after a successful logout", async () => {
    signOut.mockResolvedValue({});
    const { getByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: "ออกจากระบบ" }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledOnce();
      expect(routerRefresh).toHaveBeenCalledOnce();
    });
  });

  it("does not refresh the page when logout fails", async () => {
    signOut.mockRejectedValue(new Error("Logout failed"));
    const { getByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: "ออกจากระบบ" }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledOnce();
    });

    expect(getByRole("button", { name: "ออกจากระบบ" })).toBeTruthy();
    expect(routerRefresh).not.toHaveBeenCalled();
  });
});
