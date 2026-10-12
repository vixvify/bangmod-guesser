// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GAME_MESSAGES } from "@/core/constants/game";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/auth-client", () => ({
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

import { GameSession } from "@/components/game/game-session";
import { AppRoutes } from "@/routes/app/routes";

describe("GameSession", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    push.mockReset();
  });

  it("renders the game screen with timer, image viewer, and submit button", () => {
    render(<GameSession />);

    expect(screen.getByText("ข้อที่")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByRole("timer")).toBeTruthy();
    expect(screen.getByRole("button", { name: "ส่งคำตอบ" })).toBeTruthy();
  });

  it("disables the submit button before any map marker is placed", () => {
    render(<GameSession />);

    const submitBtn = screen.getByRole("button", { name: "ส่งคำตอบ" });
    expect(submitBtn.hasAttribute("disabled")).toBe(true);
  });

  it("confirms leaving when submitting the current mock round", () => {
    render(<GameSession />);

    const submitBtn = screen.getByRole("button", { name: "ส่งคำตอบ" });
    expect(submitBtn.hasAttribute("disabled")).toBe(true);

    const mapButton = screen.getByTestId("mock-map");
    fireEvent.click(mapButton);

    expect(submitBtn.hasAttribute("disabled")).toBe(false);

    fireEvent.click(submitBtn);
    expect(push).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: GAME_MESSAGES.exitGame.title });
    fireEvent.click(within(dialog).getByRole("button", { name: GAME_MESSAGES.exitGame.cancel }));
    expect(push).not.toHaveBeenCalled();

    fireEvent.click(submitBtn);
    fireEvent.click(within(screen.getByRole("dialog", { name: GAME_MESSAGES.exitGame.title }))
      .getByRole("button", { name: GAME_MESSAGES.exitGame.confirm }));
    expect(push).toHaveBeenCalledWith(AppRoutes.home);
  });

  it("confirms the exit button before leaving", () => {
    render(<GameSession />);

    fireEvent.click(screen.getByRole("button", { name: GAME_MESSAGES.exitGame.button }));
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: GAME_MESSAGES.exitGame.title })).toBeTruthy();
  });

  it("warns on browser Back, then stays in the game when cancelled", () => {
    render(<GameSession />);

    fireEvent.popState(window);
    const dialog = screen.getByRole("dialog", { name: GAME_MESSAGES.exitGame.title });
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: GAME_MESSAGES.exitGame.cancel }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("continues browser Back after confirmation", () => {
    const go = vi.spyOn(window.history, "go").mockImplementation(() => {});
    render(<GameSession />);

    fireEvent.popState(window);
    fireEvent.click(within(screen.getByRole("dialog", { name: GAME_MESSAGES.exitGame.title }))
      .getByRole("button", { name: GAME_MESSAGES.exitGame.confirm }));

    expect(go).toHaveBeenCalledWith(-2);
    expect(push).not.toHaveBeenCalled();
  });

  it("uses the native browser warning for reload or tab close", () => {
    render(<GameSession />);

    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});
