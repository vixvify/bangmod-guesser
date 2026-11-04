// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LobbyMenu } from "@/features/home/components/lobby-menu";

const { push, router, getSession } = vi.hoisted(() => {
  const push = vi.fn();
  return { push, router: { push }, getSession: vi.fn() };
});
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/features/auth/auth-client", () => ({ getSession }));

beforeEach(() => {
  push.mockReset();
  getSession.mockResolvedValue({ data: { user: { id: "user-1" } } });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("LobbyMenu", () => {
  it("starts one countdown and navigates to the game only after three seconds", async () => {
    vi.useFakeTimers();
    render(<LobbyMenu />);
    const play = screen.getByRole<HTMLButtonElement>("button", {
      name: "Play Bangmod Guesser",
    });

    expect(play.disabled).toBe(false);
    expect(play.querySelector("svg")?.getAttribute("class")).not.toMatch(/transition|translate/);
    expect(play.className).not.toContain("enabled:hover:-translate-y");
    expect(play.className).not.toContain("enabled:hover:rotate");
    expect(play.className).not.toContain("enabled:hover:scale");
    await act(async () => {
      fireEvent.click(play);
    });
    expect(play.disabled).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("3");
    fireEvent.click(play);
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(push).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(701);
    });
    expect(push).toHaveBeenCalledExactlyOnceWith("/game/demo");
  });

  it("keeps instructions and credits out of the lobby actions", () => {
    render(<LobbyMenu />);

    expect(screen.queryByRole("button", { name: /วิธีเล่น/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Credits" })).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
