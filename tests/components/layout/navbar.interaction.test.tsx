// @vitest-environment jsdom

import { cleanup, fireEvent, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/features/users/user";
import { SETTINGS_MESSAGES } from "@/features/settings/settings.constants";

const { signOut, routerRefresh, toastError, toastSuccess, httpGet, httpPost } = vi.hoisted(() => ({
  signOut: vi.fn(),
  routerRefresh: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  httpGet: vi.fn(),
  httpPost: vi.fn(),
}));

const { playSoundEffect } = vi.hoisted(() => ({ playSoundEffect: vi.fn() }));

vi.mock("@/shared/lib/sound-effect", () => ({ playSoundEffect }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerRefresh }),
  usePathname: () => "/",
}));

vi.mock("@/shared/lib/http", () => ({
  default: {
    post: vi.fn((url: string, body?: unknown) => httpPost(url, body)),
    get: vi.fn((url: string) => httpGet(url)),
  },
}));

vi.mock("@/features/auth/session.routes", () => ({
  SessionRoutes: { logout: "/session/logout" },
}));

vi.mock("sonner", () => ({ toast: { error: toastError, success: toastSuccess } }));

import { Navbar } from "@/shared/components/layout/navbar";

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
    playSoundEffect.mockReset();
    httpGet.mockReset().mockResolvedValue({ data: { activeGameId: null } });
    httpPost.mockReset().mockImplementation((url: string) => {
      if (url === "/session/logout") {
        return signOut();
      }
      return Promise.resolve({ data: {} });
    });
  });

  it("focuses Home before Settings and shows the settings tooltip", async () => {
    const keyboard = userEvent.setup();
    const { getByRole, findByRole } = render(<Navbar user={user} />);

    await keyboard.tab();
    await keyboard.tab();
    expect(document.activeElement).toBe(getByRole("link", { name: "หน้าหลัก" }));

    await keyboard.tab();
    expect(document.activeElement).toBe(getByRole("button", { name: SETTINGS_MESSAGES.title }));
    expect((await findByRole("tooltip")).textContent).toBe(SETTINGS_MESSAGES.title);
  });

  it("links the home icon to the homepage", () => {
    const { getByRole } = render(<Navbar user={user} />);
    expect(getByRole("link", { name: "หน้าหลัก" }).getAttribute("href")).toBe("/");
  });

  it("opens a confirmation dialog and leaves the user signed in when cancelled", async () => {
    const { getByRole, queryByRole, findByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: /ออกจากระบบ/ }));

    const dialog = await findByRole("dialog");
    expect(dialog.className).toContain("bg-secondary-main");
    expect(signOut).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole("button", { name: "ยกเลิก" }));

    await waitFor(() => expect(queryByRole("dialog")).toBeNull());
    expect(signOut).not.toHaveBeenCalled();
    expect(routerRefresh).not.toHaveBeenCalled();
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("signs out and refreshes only after confirmation", async () => {
    signOut.mockResolvedValue({});
    const { getByRole, findByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: /ออกจากระบบ/ }));
    const dialog = await findByRole("dialog");
    expect(signOut).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledOnce();
      expect(toastSuccess).toHaveBeenCalledWith("ออกจากระบบสำเร็จ");
      expect(routerRefresh).toHaveBeenCalledOnce();
    });
    expect(toastError).not.toHaveBeenCalled();
  });

  it("keeps the dialog open and shows an error when logout fails", async () => {
    signOut.mockRejectedValue(new Error("Logout failed"));
    const { getByRole, findByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: /ออกจากระบบ/ }));
    const dialog = await findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledOnce();
    });

    expect(getByRole("dialog")).toBeTruthy();
    expect(toastError).toHaveBeenCalledOnce();
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(routerRefresh).not.toHaveBeenCalled();
  });

  it("does not refresh when sign out returns an error response", async () => {
    signOut.mockRejectedValue(new Error("Sign out failed"));
    const { getByRole, findByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: /ออกจากระบบ/ }));
    const dialog = await findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() => expect(toastError).toHaveBeenCalledOnce());
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(getByRole("dialog")).toBeTruthy();
    expect(routerRefresh).not.toHaveBeenCalled();
  });

  it("shows active game warning when active game exists and stays signed in when cancelled", async () => {
    httpGet.mockResolvedValueOnce({ data: { activeGameId: "game-active-123" } });
    const { getByRole, queryByRole, findByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: /ออกจากระบบ/ }));

    const dialog = await findByRole("dialog");
    expect(dialog.textContent).toContain("มีเกมกำลังเล่นอยู่");
    expect(dialog.textContent).toContain("ต้องการจะออกจากระบบหรือไม่");
    expect(signOut).not.toHaveBeenCalled();

    fireEvent.click(getByRole("button", { name: "ยกเลิก" }));
    await waitFor(() => expect(queryByRole("dialog")).toBeNull());
    expect(signOut).not.toHaveBeenCalled();
  });

  it("terminates active game and logs out when active game warning is confirmed", async () => {
    httpGet.mockResolvedValueOnce({ data: { activeGameId: "game-active-123" } });
    signOut.mockResolvedValue({});
    const { getByRole, findByRole } = render(<Navbar user={user} />);

    fireEvent.click(getByRole("button", { name: /ออกจากระบบ/ }));

    const dialog = await findByRole("dialog");
    expect(dialog.textContent).toContain("มีเกมกำลังเล่นอยู่");

    fireEvent.click(getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() => {
      expect(httpPost).toHaveBeenCalledWith(expect.stringContaining("/games/game-active-123/exit"), undefined);
      expect(signOut).toHaveBeenCalledOnce();
      expect(toastSuccess).toHaveBeenCalledWith("ออกจากระบบสำเร็จ");
      expect(routerRefresh).toHaveBeenCalledOnce();
    });
  });

  it("opens settings modal when settings button is clicked and closes on cancel", async () => {
    const { getByRole, queryByRole } = render(<Navbar user={user} />);
    const settingsButton = getByRole("button", { name: "ตั้งค่าเกม" });

    expect(settingsButton.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(settingsButton);
    expect(playSoundEffect).toHaveBeenCalledWith("click");

    expect(getByRole("dialog")).toBeTruthy();
    expect(settingsButton.getAttribute("aria-pressed")).toBe("true");
    expect(getByRole("heading", { name: "ตั้งค่าเกม" })).toBeTruthy();

    fireEvent.click(getByRole("button", { name: "ยกเลิก" }));

    await waitFor(() => expect(queryByRole("dialog")).toBeNull());
    expect(settingsButton.getAttribute("aria-pressed")).toBe("false");
  });

  it("keeps the admin navbar and its settings modal silent", () => {
    const { getByRole } = render(<Navbar user={user} soundEnabled={false} />);

    fireEvent.click(getByRole("button", { name: SETTINGS_MESSAGES.title }));
    fireEvent.click(getByRole("button", { name: SETTINGS_MESSAGES.confirm }));

    expect(playSoundEffect).not.toHaveBeenCalled();
  });
});
