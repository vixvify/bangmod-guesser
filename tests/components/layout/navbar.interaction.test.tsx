// @vitest-environment jsdom

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/core/domain/user";

const routerRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerRefresh }),
}));

vi.mock("@/routes/api/auth.routes", () => ({
  AuthRoutes: { logout: "/api/auth/logout" },
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
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    routerRefresh.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("calls the logout endpoint and refreshes the page after a successful logout", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));
    const { getByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      expect(routerRefresh).toHaveBeenCalledOnce();
    });
  });

  it("does not refresh the page when logout fails", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));
    const { getByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledOnce();
    });

    expect(getByRole("button", { name: "Logout" })).toBeTruthy();
    expect(routerRefresh).not.toHaveBeenCalled();
  });
});
