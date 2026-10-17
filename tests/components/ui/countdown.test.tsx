// @vitest-environment jsdom

import { StrictMode } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Countdown } from "@/components/ui/countdown";
import { playSoundEffect } from "@/lib/sound-effect";

vi.mock("@/lib/sound-effect", () => ({ playSoundEffect: vi.fn() }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(playSoundEffect).mockClear();
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("Countdown", () => {
  it("shows 3, 2, 1 for one second each then completes once in Strict Mode", () => {
    const onComplete = vi.fn();
    render(<StrictMode><Countdown onComplete={onComplete} /></StrictMode>);
    expect(screen.getByRole("status").textContent).toBe("3");
    expect(playSoundEffect).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByRole("status").textContent).toBe("2");
    expect(playSoundEffect).toHaveBeenLastCalledWith("click");
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByRole("status").textContent).toBe("1");
    expect(playSoundEffect).toHaveBeenNthCalledWith(2, "click");
    act(() => { vi.advanceTimersByTime(999); });
    expect(onComplete).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.getByRole("status").textContent).toBe("ไปกันเลย!");
    expect(playSoundEffect).toHaveBeenNthCalledWith(3, "accept");
    expect(onComplete).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(700); });
    expect(onComplete).toHaveBeenCalledOnce();
    expect(screen.queryByText("0")).toBeNull();
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("cancels completion when unmounted", () => {
    const onComplete = vi.fn();
    const { unmount } = render(<Countdown onComplete={onComplete} />);
    act(() => { vi.advanceTimersByTime(1000); });
    unmount();
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onComplete).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
