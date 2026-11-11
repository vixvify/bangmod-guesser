// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GAME_MESSAGES } from "@/features/game/game.constants";

const push = vi.fn();
const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
const toastError = vi.hoisted(() => vi.fn());
vi.mock("sonner", () => ({ toast: { error: toastError, success: vi.fn() } }));
vi.mock("@/shared/lib/http", () => ({ httpClient: api }));
vi.mock("@/features/game/game.routes", () => ({ GameRoutes: {
  currentRound: (id: string) => `/games/${id}/current-round`,
  guess: (id: string, round: number) => `/games/${id}/rounds/${round}/guess`,
  roundResult: (id: string, round: number) => `/games/${id}/rounds/${round}/result`,
  exit: (id: string) => `/games/${id}/exit`,
} }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/features/auth/auth-client", () => ({
  authClient: { signOut: vi.fn() },
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
import { AppRoutes } from "@/shared/routes/routes";

describe("GameSession", () => {
  beforeEach(() => {
    api.get.mockResolvedValue({ data: { questionNumber: 1, imageUrl: "/images/kmutt-bangmod-1.jpg", deadlineAt: new Date(Date.now() + 40000).toISOString() } });
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
    api.get.mockResolvedValueOnce({ data: { questionNumber: 3, imageUrl: "/images/kmutt-bangmod-1.jpg", deadlineAt: new Date(Date.now() - 1000).toISOString() } });
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
      .mockResolvedValueOnce({ data: { questionNumber: 1, imageUrl: "/images/kmutt-bangmod-1.jpg", deadlineAt: new Date(Date.now() + 40000).toISOString() } })
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
});
