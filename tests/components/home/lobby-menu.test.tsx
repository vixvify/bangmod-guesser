// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LobbyMenu } from "@/components/home/lobby-menu";

const { push, router } = vi.hoisted(() => {
  const push = vi.fn();
  return { push, router: { push } };
});
vi.mock("next/navigation", () => ({ useRouter: () => router }));

beforeEach(() => {
  push.mockReset();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("LobbyMenu", () => {
  it("starts one countdown and navigates to the game only after three seconds", () => {
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
    fireEvent.click(play);
    expect(play.disabled).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("3");
    fireEvent.click(play);
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(push).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(push).toHaveBeenCalledExactlyOnceWith("/game");
  });

  it("keeps instructions and credits out of the lobby actions", () => {
    render(<LobbyMenu />);

    expect(screen.queryByRole("button", { name: /วิธีเล่น/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Credits" })).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
