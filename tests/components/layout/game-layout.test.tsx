// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GAME_MESSAGES } from "@/core/constants/game";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

import { GameLayout } from "@/layout/game-layout";

describe("GameLayout", () => {
  afterEach(cleanup);

  it("renders children content", () => {
    render(
      <GameLayout>
        <p>Game content</p>
      </GameLayout>,
    );

    expect(screen.getByText("Game content")).toBeTruthy();
  });

  it("renders a decorative backdrop behind the game content", () => {
    const { container } = render(
      <GameLayout>
        <p>Game content</p>
      </GameLayout>,
    );

    const backdrop = container.querySelector("[data-game-backdrop]");
    expect(backdrop?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("Game content")).toBeTruthy();
  });

  it("renders the header center slot", () => {
    render(
      <GameLayout headerCenter={<span>Timer</span>}>
        <p>Content</p>
      </GameLayout>,
    );

    expect(screen.getByText("Timer")).toBeTruthy();
  });

  it("renders the settings button", () => {
    render(
      <GameLayout>
        <p>Content</p>
      </GameLayout>,
    );

    expect(screen.getByRole("button", { name: "ตั้งค่าเกม" })).toBeTruthy();
  });

  it("renders the exit game button", () => {
    render(
      <GameLayout>
        <p>Content</p>
      </GameLayout>,
    );

    expect(
      screen.getByRole("button", { name: GAME_MESSAGES.exitGame.button }),
    ).toBeTruthy();
  });

  it("opens the settings dialog when the settings button is clicked", () => {
    render(
      <GameLayout>
        <p>Content</p>
      </GameLayout>,
    );

    fireEvent.click(screen.getByRole("button", { name: "ตั้งค่าเกม" }));

    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("opens the exit confirm dialog when exit button is clicked", () => {
    render(
      <GameLayout>
        <p>Content</p>
      </GameLayout>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: GAME_MESSAGES.exitGame.button }),
    );

    expect(
      screen.getByRole("heading", { name: GAME_MESSAGES.exitGame.title }),
    ).toBeTruthy();
    expect(screen.getByText(GAME_MESSAGES.exitGame.description)).toBeTruthy();
  });

  it("closes the exit dialog when cancel is clicked", async () => {
    render(
      <GameLayout>
        <p>Content</p>
      </GameLayout>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: GAME_MESSAGES.exitGame.button }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: GAME_MESSAGES.exitGame.cancel }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: GAME_MESSAGES.exitGame.title }),
      ).toBeNull();
    });
  });

  it("has the game menu navigation landmark", () => {
    render(
      <GameLayout>
        <p>Content</p>
      </GameLayout>,
    );

    expect(screen.getByRole("navigation", { name: "เมนูเกม" })).toBeTruthy();
  });
});
