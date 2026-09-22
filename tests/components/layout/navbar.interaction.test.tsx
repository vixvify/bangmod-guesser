// @vitest-environment jsdom

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/core/domain/user";

const { logout, routerRefresh } = vi.hoisted(() => ({
  logout: vi.fn(),
  routerRefresh: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerRefresh }),
}));

vi.mock("@/routes/api/auth.routes", () => ({
  AuthRoutes: { logout: "/api/auth/logout" },
}));

vi.mock("@/lib/http", () => ({
  httpClient: { post: logout },
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
    logout.mockReset();
  });

  it("calls the logout endpoint and refreshes the page after a successful logout", async () => {
    logout.mockResolvedValue({ data: null, status: 200, statusCode: "SUCCESS" });
    const { getByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(logout).toHaveBeenCalledWith("/api/auth/logout");
      expect(routerRefresh).toHaveBeenCalledOnce();
    });
  });

  it("does not refresh the page when logout fails", async () => {
    logout.mockRejectedValue(new Error("Logout failed"));
    const { getByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(logout).toHaveBeenCalledOnce();
    });

    expect(getByRole("button", { name: "Logout" })).toBeTruthy();
    expect(routerRefresh).not.toHaveBeenCalled();
  });
});
