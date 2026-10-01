// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GameTimer } from "@/components/game/game-timer";

vi.mock("@/hooks/use-countdown", () => ({
  useCountdown: vi.fn(({ initialSeconds }: { initialSeconds: number }) => ({
    secondsLeft: initialSeconds,
    isUrgent: initialSeconds <= 10,
  })),
}));

import { useCountdown } from "@/hooks/use-countdown";

const mockedUseCountdown = vi.mocked(useCountdown);

describe("GameTimer", () => {
  afterEach(cleanup);

  it("renders a timer element with the correct aria label", () => {
    render(<GameTimer initialSeconds={40} />);

    const timer = screen.getByRole("timer");
    expect(timer).toBeTruthy();
    expect(timer.getAttribute("aria-label")).toBe("เวลาที่เหลือ");
  });

  it("displays the formatted time from useCountdown", () => {
    render(<GameTimer initialSeconds={40} />);

    expect(screen.getByText("00:40")).toBeTruthy();
  });

  it("displays the timer label text", () => {
    render(<GameTimer initialSeconds={40} />);

    expect(screen.getByText("เวลาที่เหลือ")).toBeTruthy();
  });

  it("applies urgent styling when isUrgent is true", () => {
    mockedUseCountdown.mockReturnValue({
      secondsLeft: 5,
      isUrgent: true,
    });

    render(<GameTimer initialSeconds={5} />);

    const timer = screen.getByRole("timer");
    expect(timer.className).toContain("text-red-400");
  });

  it("does not apply urgent styling when isUrgent is false", () => {
    mockedUseCountdown.mockReturnValue({
      secondsLeft: 30,
      isUrgent: false,
    });

    render(<GameTimer initialSeconds={30} />);

    const timer = screen.getByRole("timer");
    expect(timer.className).not.toContain("text-red-400");
  });

  it("passes onTimeUp to the countdown hook", () => {
    const onTimeUp = vi.fn();
    render(<GameTimer initialSeconds={40} onTimeUp={onTimeUp} />);

    expect(mockedUseCountdown).toHaveBeenCalledWith(
      expect.objectContaining({ onTimeUp }),
    );
  });
});
