// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LobbyMenu } from "@/features/home/components/lobby-menu";

const { push, router, getSession } = vi.hoisted(() => {
  const push = vi.fn();
  return { push, router: { push }, getSession: vi.fn() };
});
const post = vi.hoisted(() => vi.fn());
const get = vi.hoisted(() => vi.fn());
const preload = vi.hoisted(() => vi.fn());
vi.mock("@/features/game/game-image", () => ({ preloadGameImage: preload }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/features/auth/auth-client", () => ({ getSession }));
vi.mock("@/shared/lib/http", () => ({ httpClient: { post, get }, HttpError: class extends Error {} }));
vi.mock("@/features/game/game.routes", () => ({ GameRoutes: { create: "/games", currentRound: (id: string) => `/games/${id}/current-round` } }));

beforeEach(() => {
  push.mockReset();
  post.mockReset();
  get.mockReset();
  preload.mockReset();
  getSession.mockResolvedValue({ data: { user: { id: "user-1" } } });
  post.mockResolvedValue({ data: { gameId: "game-123" } });
  get.mockResolvedValue({ data: { questionNumber: 1, imageUrl: "/question.jpg", deadlineAt: null } });
  preload.mockResolvedValue(undefined);
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
    await act(async () => {
      vi.advanceTimersByTime(701);
    });
    expect(post).toHaveBeenCalledWith("/games");
    expect(push).toHaveBeenCalledExactlyOnceWith("/game/game-123");
  });

  it("keeps instructions and credits out of the lobby actions", () => {
    render(<LobbyMenu />);

    expect(screen.queryByRole("button", { name: /วิธีเล่น/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Credits" })).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("waits for the first image before the countdown and starts the round afterwards", async () => {
    let finishLoading!: () => void;
    preload.mockReturnValueOnce(new Promise<void>((resolve) => { finishLoading = resolve; }));
    render(<LobbyMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Play Bangmod Guesser" }));
    await waitFor(() => expect(preload).toHaveBeenCalledWith("/question.jpg"));
    expect(screen.getByText("กำลังเตรียมเกมและโหลดรูป…")).toBeTruthy();
    expect(screen.queryByRole("dialog", { name: "กำลังเข้าสู่เกม" })).toBeNull();
    expect(post).not.toHaveBeenCalledWith("/games/game-123/current-round", expect.anything());
    await act(async () => finishLoading());
    expect(screen.getByRole("dialog", { name: "กำลังเข้าสู่เกม" })).toBeTruthy();
  });

  it("allows retrying a failed image without creating another game", async () => {
    preload.mockRejectedValueOnce(new Error("image failed"));
    render(<LobbyMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Play Bangmod Guesser" }));
    fireEvent.click(await screen.findByRole("button", { name: "ลองอีกครั้ง" }));
    await screen.findByRole("dialog", { name: "กำลังเข้าสู่เกม" });
    expect(post.mock.calls.filter(([url]) => url === "/games")).toHaveLength(1);
  });
});
