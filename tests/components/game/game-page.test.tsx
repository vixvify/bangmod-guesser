// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GAME_MESSAGES } from "@/features/game/game.constants";

vi.mock("@/features/game/game-image", () => ({ preloadGameImage: vi.fn().mockResolvedValue(undefined) }));
const push = vi.fn();
const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
const toastError = vi.hoisted(() => vi.fn());
const toastInfo = vi.hoisted(() => vi.fn());
const getSessionMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
);
vi.mock("sonner", () => ({ toast: { error: toastError, info: toastInfo, success: vi.fn() } }));
vi.mock("@/shared/lib/http", () => ({ httpClient: api }));
vi.mock("@/features/game/game.routes", () => ({ GameRoutes: {
  currentRound: (id: string) => `/games/${id}/current-round`,
  guess: (id: string, round: number) => `/games/${id}/rounds/${round}/guess`,
  roundResult: (id: string, round: number) => `/games/${id}/rounds/${round}/result`,
  exit: (id: string) => `/games/${id}/exit`,
  terminate: (id: string) => `/games/${id}/terminate`,
} }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/features/auth/auth-client", () => ({
  authClient: { signOut: vi.fn(), getSession: getSessionMock },
  getSession: getSessionMock,
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, priority, ...rest }: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} data-fill={fill} data-priority={priority} />;
  },
}));

vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: () => {
    const MockedComponent = ({
      onMapClick,
    }: {
      onMapClick?: (lat: number, lng: number) => void;
    }) => (
      <button
        data-testid="mock-map"
        onClick={() => onMapClick?.(13.6513, 100.4943)}
      >
        Click Map
      </button>
    );
    MockedComponent.displayName = "DynamicGameMap";
    return MockedComponent;
  },
}));

import { GameSession } from "@/features/game/components/game-session";
import { preloadGameImage } from "@/features/game/game-image";
import { AppRoutes } from "@/shared/routes/routes";
import {
  NavigationGuardProvider,
  useNavigationGuard,
} from "@/shared/hooks/use-navigation-guard";

function TestNavTrigger({ target = "/leaderboard" }: { target?: string }) {
  const guard = useNavigationGuard();
  return (
    <button
      type="button"
      onClick={() => {
        if (!guard?.request(() => push(target))) {
          push(target);
        }
      }}
    >
      นำทางไปที่อื่น
    </button>
  );
}

describe("GameSession", () => {
  beforeEach(() => {
    vi.mocked(preloadGameImage).mockResolvedValue(undefined);
    api.get.mockResolvedValue({ data: { questionNumber: 1, imageUrl: "/images/kmutt-bangmod-1.jpg", deadlineAt: new Date(Date.now() + 40000).toISOString(), serverTime: new Date().toISOString() } });
    api.post.mockResolvedValue({ data: {} });
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    push.mockReset();
    vi.clearAllMocks();
  });

  it("renders the game screen with timer, image viewer, and submit button", async () => {
    render(<GameSession gameId="test-game" />);
    await screen.findByRole("timer");

    expect(screen.getByText("ข้อที่")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByRole("timer")).toBeTruthy();
    expect(screen.getByRole("button", { name: "ส่งคำตอบ" })).toBeTruthy();
  });

  it("uses the server clock when the player's clock differs", async () => {
    api.get.mockResolvedValueOnce({ data: {
      questionNumber: 1,
      imageUrl: "/question.jpg",
      serverTime: "2020-01-01T00:00:00.000Z",
      deadlineAt: "2020-01-01T00:00:40.000Z",
    } });
    render(<GameSession gameId="test-game" />);
    expect(await screen.findByText("00:40")).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("starts the round only after its image is loaded", async () => {
    let finishLoading!: () => void;
    vi.mocked(preloadGameImage).mockReturnValueOnce(new Promise<void>((resolve) => { finishLoading = resolve; }));
    api.get.mockResolvedValueOnce({ data: { questionNumber: 1, imageUrl: "/question.jpg", deadlineAt: null } });
    api.post.mockResolvedValueOnce({ data: { questionNumber: 1, imageUrl: "/question.jpg", deadlineAt: new Date(Date.now() + 40000).toISOString(), serverTime: new Date().toISOString() } });
    render(<GameSession gameId="test-game" />);
    await waitFor(() => expect(preloadGameImage).toHaveBeenCalledWith("/question.jpg"));
    expect(api.post).not.toHaveBeenCalled();
    finishLoading();
    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/games/test-game/current-round", { questionNumber: 1 }));
    expect(await screen.findByRole("timer")).toBeTruthy();
  });

  it("disables the submit button before any map marker is placed", async () => {
    render(<GameSession gameId="test-game" />);

    const submitBtn = await screen.findByRole("button", { name: "ส่งคำตอบ" });
    expect(submitBtn.hasAttribute("disabled")).toBe(true);
  });

  it("sends the selected coordinates and opens the round score", async () => {
    render(<GameSession gameId="test-game" />);

    const submitBtn = await screen.findByRole("button", { name: "ส่งคำตอบ" });
    expect(submitBtn.hasAttribute("disabled")).toBe(true);

    const mapButton = screen.getByTestId("mock-map");
    fireEvent.click(mapButton);

    expect(submitBtn.hasAttribute("disabled")).toBe(false);

    fireEvent.click(submitBtn);
    await waitFor(() => expect(push).toHaveBeenCalledWith(AppRoutes.gameRoundScore("test-game", 1)));
    expect(api.post).toHaveBeenCalledWith(expect.stringContaining("/games/test-game/rounds/1/guess"), { guessedLatitude: 13.6513, guessedLongitude: 100.4943 });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("records a timeout using null coordinates when the server deadline has passed", async () => {
    api.get.mockResolvedValueOnce({ data: { questionNumber: 3, imageUrl: "/images/kmutt-bangmod-1.jpg", deadlineAt: new Date(Date.now() - 1000).toISOString(), serverTime: new Date().toISOString() } });
    render(<GameSession gameId="test-game" />);
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(expect.stringContaining("/rounds/3/guess"), { guessedLatitude: null, guessedLongitude: null }));
    await waitFor(() => expect(push).toHaveBeenCalledWith(AppRoutes.gameRoundScore("test-game", 3)));
  });

  it("recovers a saved result if the submission response is lost", async () => {
    api.post.mockRejectedValueOnce(new Error("network"));
    render(<GameSession gameId="test-game" />);
    await screen.findByRole("button", { name: "ส่งคำตอบ" });
    fireEvent.click(screen.getByTestId("mock-map"));
    fireEvent.click(screen.getByRole("button", { name: "ส่งคำตอบ" }));
    await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/rounds/1/result")));
    await waitFor(() => expect(push).toHaveBeenCalledWith(AppRoutes.gameRoundScore("test-game", 1)));
  });

  it("shows the saved result when another tab submitted the round first", async () => {
    api.post.mockRejectedValueOnce(Object.assign(new Error("already submitted"), { name: "HttpError", status: 409 }));
    render(<GameSession gameId="test-game" />);
    await screen.findByRole("button", { name: "ส่งคำตอบ" });
    fireEvent.click(screen.getByTestId("mock-map"));
    fireEvent.click(screen.getByRole("button", { name: "ส่งคำตอบ" }));
    await waitFor(() => expect(toastInfo).toHaveBeenCalledWith("รอบนี้ส่งคำตอบไปแล้ว กำลังแสดงผลที่บันทึกไว้"));
    expect(push).toHaveBeenCalledWith(AppRoutes.gameRoundScore("test-game", 1));
  });

  it("explains when the game has ended and lets the player return home", async () => {
    api.post.mockRejectedValueOnce(Object.assign(new Error("ended"), { name: "HttpError", status: 409, statusCode: "GAME_ENDED" }));
    render(<GameSession gameId="test-game" />);
    await screen.findByRole("button", { name: "ส่งคำตอบ" });
    fireEvent.click(screen.getByTestId("mock-map"));
    fireEvent.click(screen.getByRole("button", { name: "ส่งคำตอบ" }));
    const dialog = await screen.findByRole("dialog", { name: "เกมนี้สิ้นสุดแล้ว" });
    expect(within(dialog).getByText(/แท็บอื่น/)).toBeTruthy();
    expect(api.get).not.toHaveBeenCalledWith(expect.stringContaining("/result"));
    fireEvent.click(within(dialog).getByRole("button", { name: "กลับหน้าแรก" }));
    expect(push).toHaveBeenCalledWith(AppRoutes.home);
  });

  it("shows the ended message when opening an interrupted game", async () => {
    api.get.mockRejectedValueOnce(Object.assign(new Error("ended"), { name: "HttpError", status: 409, statusCode: "GAME_ENDED" }));
    render(<GameSession gameId="test-game" />);
    expect(await screen.findByRole("dialog", { name: "เกมนี้สิ้นสุดแล้ว" })).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("shows rate limiting without trying to recover a result that was not submitted", async () => {
    const error = Object.assign(new Error("limited"), { name: "HttpError", status: 429, retryAfter: 10 });
    api.post.mockRejectedValueOnce(error);
    render(<GameSession gameId="test-game" />);
    await screen.findByRole("button", { name: "ส่งคำตอบ" });
    fireEvent.click(screen.getByTestId("mock-map"));
    fireEvent.click(screen.getByRole("button", { name: "ส่งคำตอบ" }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("ส่งคำขอบ่อยเกินไป กรุณารอ 10 วินาทีแล้วลองอีกครั้ง"));
    expect(api.get).not.toHaveBeenCalledWith(expect.stringContaining("/result"));
    expect(push).not.toHaveBeenCalled();
  });

  it("allows retrying when neither submission nor result retrieval succeeds", async () => {
    api.post.mockRejectedValueOnce(new Error("network"));
    api.get.mockReset()
      .mockResolvedValueOnce({ data: { questionNumber: 1, imageUrl: "/images/kmutt-bangmod-1.jpg", deadlineAt: new Date(Date.now() + 40000).toISOString(), serverTime: new Date().toISOString() } })
      .mockRejectedValueOnce(new Error("not saved"));
    render(<GameSession gameId="test-game" />);
    await screen.findByRole("button", { name: "ส่งคำตอบ" });
    fireEvent.click(screen.getByTestId("mock-map"));
    fireEvent.click(screen.getByRole("button", { name: "ส่งคำตอบ" }));
    fireEvent.click(await screen.findByRole("button", { name: "ลองส่งคำตอบอีกครั้ง" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith(AppRoutes.gameRoundScore("test-game", 1)));
  });

  it("confirms the exit button before leaving", () => {
    render(<GameSession gameId="test-game" />);

    fireEvent.click(screen.getByRole("button", { name: GAME_MESSAGES.exitGame.button }));
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: GAME_MESSAGES.exitGame.title })).toBeTruthy();
  });

  it("warns on browser Back, then stays in the game when cancelled", () => {
    render(<GameSession gameId="test-game" />);

    fireEvent.popState(window);
    const dialog = screen.getByRole("dialog", { name: GAME_MESSAGES.exitGame.title });
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: GAME_MESSAGES.exitGame.cancel }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("continues browser Back after confirmation", async () => {
    const go = vi.spyOn(window.history, "go").mockImplementation(() => {});
    render(<GameSession gameId="test-game" />);

    fireEvent.popState(window);
    fireEvent.click(within(screen.getByRole("dialog", { name: GAME_MESSAGES.exitGame.title }))
      .getByRole("button", { name: GAME_MESSAGES.exitGame.confirm }));

    await waitFor(() => expect(go).toHaveBeenCalledWith(-2));
    expect(push).not.toHaveBeenCalled();
  });

  it("uses the native browser warning for reload or tab close", () => {
    render(<GameSession gameId="test-game" />);

    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("warns when client navigation is requested via useNavigationGuard, then cancels", async () => {
    render(
      <NavigationGuardProvider>
        <GameSession gameId="test-game" />
        <TestNavTrigger target="/leaderboard" />
      </NavigationGuardProvider>,
    );

    await screen.findByRole("timer");
    fireEvent.click(screen.getByRole("button", { name: "นำทางไปที่อื่น" }));

    const dialog = screen.getByRole("dialog", {
      name: GAME_MESSAGES.exitGame.title,
    });
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(
      within(dialog).getByRole("button", {
        name: GAME_MESSAGES.exitGame.cancel,
      }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(push).not.toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalledWith("/games/test-game/exit");
  });

  it("exits the game via API and proceeds with client navigation when confirmed", async () => {
    render(
      <NavigationGuardProvider>
        <GameSession gameId="test-game" />
        <TestNavTrigger target="/profile" />
      </NavigationGuardProvider>,
    );

    await screen.findByRole("timer");
    fireEvent.click(screen.getByRole("button", { name: "นำทางไปที่อื่น" }));

    const dialog = screen.getByRole("dialog", {
      name: GAME_MESSAGES.exitGame.title,
    });
    fireEvent.click(
      within(dialog).getByRole("button", {
        name: GAME_MESSAGES.exitGame.confirm,
      }),
    );

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/games/test-game/exit"),
    );
    expect(push).toHaveBeenCalledWith("/profile");
  });

  it("shows an error and stays on page if exit API fails during navigation confirmation", async () => {
    api.post.mockImplementation((url: string) => {
      if (url === "/games/test-game/exit") {
        return Promise.reject(new Error("network error"));
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <NavigationGuardProvider>
        <GameSession gameId="test-game" />
        <TestNavTrigger target="/profile" />
      </NavigationGuardProvider>,
    );

    await screen.findByRole("timer");
    fireEvent.click(screen.getByRole("button", { name: "นำทางไปที่อื่น" }));

    const dialog = screen.getByRole("dialog", {
      name: GAME_MESSAGES.exitGame.title,
    });
    fireEvent.click(
      within(dialog).getByRole("button", {
        name: GAME_MESSAGES.exitGame.confirm,
      }),
    );

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        "ออกจากเกมไม่สำเร็จ กรุณาลองอีกครั้ง",
      ),
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("sends exit on pagehide when navigating away or closing window directly", async () => {
    render(<GameSession gameId="test-game" />);
    await screen.findByRole("timer");

    window.dispatchEvent(new Event("pagehide"));

    expect(api.post).toHaveBeenCalledWith("/games/test-game/exit");
  });

  it("does not send exit on pagehide after a round is submitted", async () => {
    render(<GameSession gameId="test-game" />);
    await screen.findByRole("timer");

    fireEvent.click(screen.getByTestId("mock-map"));
    fireEvent.click(screen.getByRole("button", { name: "ส่งคำตอบ" }));
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        AppRoutes.gameRoundScore("test-game", 1),
      ),
    );

    api.post.mockClear();
    window.dispatchEvent(new Event("pagehide"));

    expect(api.post).not.toHaveBeenCalledWith(
      expect.stringContaining("/exit"),
    );
  });

  it("does not send exit on pagehide if game has already ended", async () => {
    api.get.mockRejectedValueOnce(
      Object.assign(new Error("ended"), {
        name: "HttpError",
        status: 409,
        statusCode: "GAME_ENDED",
      }),
    );
    render(<GameSession gameId="test-game" />);
    expect(
      await screen.findByRole("dialog", { name: "เกมนี้สิ้นสุดแล้ว" }),
    ).toBeTruthy();

    api.post.mockClear();
    window.dispatchEvent(new Event("pagehide"));

    expect(api.post).not.toHaveBeenCalledWith(
      expect.stringContaining("/exit"),
    );
  });

  it("shows session expired modal and terminates game when loadRound returns 401", async () => {
    api.get.mockRejectedValueOnce(
      Object.assign(new Error("unauthorized"), {
        name: "HttpError",
        status: 401,
      }),
    );
    render(<GameSession gameId="test-game" />);
    expect(
      await screen.findByRole("dialog", { name: "Session นี้หมดอายุแล้ว" }),
    ).toBeTruthy();

    expect(api.post).toHaveBeenCalledWith("/games/test-game/terminate");

    fireEvent.click(screen.getByRole("button", { name: "กลับหน้าแรก" }));
    expect(push).toHaveBeenCalledWith(AppRoutes.home);
  });

  it("shows session expired modal and terminates game when submit returns 401", async () => {
    render(<GameSession gameId="test-game" />);
    await screen.findByRole("timer");

    api.post.mockRejectedValueOnce(
      Object.assign(new Error("unauthorized"), {
        name: "HttpError",
        status: 401,
      }),
    );

    fireEvent.click(screen.getByTestId("mock-map"));
    fireEvent.click(screen.getByRole("button", { name: "ส่งคำตอบ" }));

    expect(
      await screen.findByRole("dialog", { name: "Session นี้หมดอายุแล้ว" }),
    ).toBeTruthy();
    expect(api.post).toHaveBeenCalledWith("/games/test-game/terminate");
  });

  it("shows session expired modal when cross-tab storage logout event is received", async () => {
    render(<GameSession gameId="test-game" />);
    await screen.findByRole("timer");

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "auth:logout",
        newValue: Date.now().toString(),
      }),
    );

    expect(
      await screen.findByRole("dialog", { name: "Session นี้หมดอายุแล้ว" }),
    ).toBeTruthy();
    expect(api.post).toHaveBeenCalledWith("/games/test-game/terminate");
  });
});
