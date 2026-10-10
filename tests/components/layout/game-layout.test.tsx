// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  const onExit = vi.fn();

  afterEach(() => {
    cleanup();
    onExit.mockReset();
  });

  it("renders children content", () => {
    render(
      <GameLayout onExit={onExit}>
        <p>Game content</p>
      </GameLayout>,
    );

    expect(screen.getByText("Game content")).toBeTruthy();
  });

  it("renders a decorative backdrop behind the game content", () => {
    const { container } = render(
      <GameLayout onExit={onExit}>
        <p>Game content</p>
      </GameLayout>,
    );

    const backdrop = container.querySelector("[data-game-backdrop]");
    expect(backdrop?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("Game content")).toBeTruthy();
  });

  it("renders the header center slot", () => {
    render(
      <GameLayout onExit={onExit} headerCenter={<span>Timer</span>}>
        <p>Content</p>
      </GameLayout>,
    );

    expect(screen.getByText("Timer")).toBeTruthy();
  });

  it("renders the settings button", () => {
    render(
      <GameLayout onExit={onExit}>
        <p>Content</p>
      </GameLayout>,
    );

    expect(screen.getByRole("button", { name: "ตั้งค่าเกม" })).toBeTruthy();
  });

  it("renders the exit game button", () => {
    render(
      <GameLayout onExit={onExit}>
        <p>Content</p>
      </GameLayout>,
    );

    expect(
      screen.getByRole("button", { name: GAME_MESSAGES.exitGame.button }),
    ).toBeTruthy();
  });

  it("opens the settings dialog when the settings button is clicked", () => {
    render(
      <GameLayout onExit={onExit}>
        <p>Content</p>
      </GameLayout>,
    );

    fireEvent.click(screen.getByRole("button", { name: "ตั้งค่าเกม" }));

    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("requests exit when the exit button is clicked", () => {
    render(
      <GameLayout onExit={onExit}>
        <p>Content</p>
      </GameLayout>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: GAME_MESSAGES.exitGame.button }),
    );

    expect(onExit).toHaveBeenCalledOnce();
  });

  it("has the game menu navigation landmark", () => {
    render(
      <GameLayout onExit={onExit}>
        <p>Content</p>
      </GameLayout>,
    );

    expect(screen.getByRole("navigation", { name: "เมนูเกม" })).toBeTruthy();
  });
});
