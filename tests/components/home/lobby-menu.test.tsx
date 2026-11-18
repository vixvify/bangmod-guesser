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
const toastError = vi.hoisted(() => vi.fn());
vi.mock("sonner", () => ({ toast: { error: toastError } }));
vi.mock("@/features/game/game-image", () => ({ preloadGameImage: preload }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/features/auth/auth-client", () => ({ getSession }));
vi.mock("@/shared/lib/http", () => ({ httpClient: { post, get }, HttpError: class extends Error {} }));
vi.mock("@/features/game/game.routes", () => ({ GameRoutes: { create: "/games", currentRound: (id: string) => `/games/${id}/current-round` } }));

beforeEach(() => {
  push.mockReset();
  getSession.mockReset();
  post.mockReset();
  get.mockReset();
  preload.mockReset();
  toastError.mockReset();
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
  it("shows the loading overlay while checking the session and keeps it during login navigation", async () => {
    let resolveSession!: (value: { data: null }) => void;
    getSession.mockReturnValueOnce(new Promise((resolve) => { resolveSession = resolve; }));
    render(<LobbyMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Play Bangmod Guesser" }));
    expect(screen.getByText("กำลังเตรียมเกมและโหลดรูป…")).toBeTruthy();
    expect(post).not.toHaveBeenCalled();
    await act(async () => resolveSession({ data: null }));
    expect(push).toHaveBeenCalledWith("/login");
    expect(screen.getByText("กำลังเตรียมเกมและโหลดรูป…")).toBeTruthy();
    expect(post).not.toHaveBeenCalled();
  });

  it("dismisses the loading overlay if the session check fails", async () => {
    getSession.mockRejectedValueOnce(new Error("offline"));
    render(<LobbyMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Play Bangmod Guesser" }));
    await waitFor(() => expect(screen.queryByText("กำลังเตรียมเกมและโหลดรูป…")).toBeNull());
    await waitFor(() => expect(screen.getByRole<HTMLButtonElement>("button", { name: "Play Bangmod Guesser" }).disabled).toBe(false));
  });

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
    expect(screen.getByText("ไปกันเลย!")).toBeTruthy();
    expect(screen.queryByText("กำลังเตรียมเกมและโหลดรูป…")).toBeNull();
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
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("ไม่สามารถเตรียมเกมหรือโหลดรูปได้ กรุณาลองอีกครั้ง"));
    expect(screen.queryByRole("button", { name: "ลองอีกครั้ง" })).toBeNull();
    const play = screen.getByRole<HTMLButtonElement>("button", { name: "Play Bangmod Guesser" });
    await waitFor(() => expect(play.disabled).toBe(false));
    fireEvent.click(play);
    await screen.findByRole("dialog", { name: "กำลังเข้าสู่เกม" });
    expect(post.mock.calls.filter(([url]) => url === "/games")).toHaveLength(1);
  });

  it("shows the rate-limit message and allows the player to try again", async () => {
    post.mockRejectedValueOnce(Object.assign(new Error("rate limited"), { name: "HttpError", status: 429, retryAfter: 10 }));
    render(<LobbyMenu />);
    const play = screen.getByRole<HTMLButtonElement>("button", { name: "Play Bangmod Guesser" });
    fireEvent.click(play);
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("ส่งคำขอบ่อยเกินไป กรุณารอ 10 วินาทีแล้วลองอีกครั้ง"));
    await waitFor(() => expect(play.disabled).toBe(false));
    fireEvent.click(play);
    await screen.findByRole("dialog", { name: "กำลังเข้าสู่เกม" });
  });

  it("offers to resume an existing game without creating a new one", async () => {
    post.mockResolvedValueOnce({ data: { gameId: "active-game", existing: true } });
    render(<LobbyMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Play Bangmod Guesser" }));
    await screen.findByRole("dialog", { name: "มีเกมที่กำลังเล่นอยู่" });
    fireEvent.click(screen.getByRole("button", { name: "เล่นต่อ" }));
    expect(push).toHaveBeenCalledWith("/game/active-game");
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("asks the server to replace only the game that was confirmed", async () => {
    post.mockResolvedValueOnce({ data: { gameId: "active-game", existing: true } });
    post.mockResolvedValueOnce({ data: { gameId: "new-game", existing: false } });
    render(<LobbyMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Play Bangmod Guesser" }));
    await screen.findByRole("dialog", { name: "มีเกมที่กำลังเล่นอยู่" });
    fireEvent.click(screen.getByRole("button", { name: "เริ่มเกมใหม่" }));
    await screen.findByRole("dialog", { name: "กำลังเข้าสู่เกม" });
    expect(post).toHaveBeenCalledWith("/games", { replaceGameId: "active-game" });
  });
});
