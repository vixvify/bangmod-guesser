// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { StrictMode } from "react";
import { useCountdown } from "@/hooks/use-countdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with the initial seconds value", () => {
    const { result } = renderHook(() =>
      useCountdown({ initialSeconds: 40 }),
    );

    expect(result.current.secondsLeft).toBe(40);
    expect(result.current.isUrgent).toBe(false);
  });

  it("decrements every second", () => {
    const { result } = renderHook(() =>
      useCountdown({ initialSeconds: 40 }),
    );

    act(() => vi.advanceTimersByTime(3000));

    expect(result.current.secondsLeft).toBe(37);
  });

  it("sets isUrgent to true when 10 seconds or less remain", () => {
    const { result } = renderHook(() =>
      useCountdown({ initialSeconds: 12 }),
    );

    expect(result.current.isUrgent).toBe(false);

    act(() => vi.advanceTimersByTime(2000));

    expect(result.current.secondsLeft).toBe(10);
    expect(result.current.isUrgent).toBe(true);
  });

  it("stops at zero and does not go negative", () => {
    const { result } = renderHook(() =>
      useCountdown({ initialSeconds: 2 }),
    );

    act(() => vi.advanceTimersByTime(5000));

    expect(result.current.secondsLeft).toBe(0);
  });

  it("calls onTimeUp when the countdown reaches zero", () => {
    const onTimeUp = vi.fn();
    renderHook(() =>
      useCountdown({ initialSeconds: 3, onTimeUp }),
    );

    expect(onTimeUp).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(3000));

    expect(onTimeUp).toHaveBeenCalledTimes(1);
  });

  it("calls onTimeUp only once in Strict Mode", () => {
    const onTimeUp = vi.fn();
    renderHook(() => useCountdown({ initialSeconds: 1, onTimeUp }), {
      wrapper: StrictMode,
    });

    act(() => vi.advanceTimersByTime(2000));

    expect(onTimeUp).toHaveBeenCalledTimes(1);
  });

  it("uses the latest onTimeUp callback after a rerender", () => {
    const originalCallback = vi.fn();
    const latestCallback = vi.fn();
    const { rerender } = renderHook(
      ({ onTimeUp }) => useCountdown({ initialSeconds: 2, onTimeUp }),
      { initialProps: { onTimeUp: originalCallback } },
    );

    rerender({ onTimeUp: latestCallback });
    act(() => vi.advanceTimersByTime(2000));

    expect(originalCallback).not.toHaveBeenCalled();
    expect(latestCallback).toHaveBeenCalledTimes(1);
  });

  it("does not call onTimeUp before reaching zero", () => {
    const onTimeUp = vi.fn();
    renderHook(() =>
      useCountdown({ initialSeconds: 5, onTimeUp }),
    );

    act(() => vi.advanceTimersByTime(3000));

    expect(onTimeUp).not.toHaveBeenCalled();
  });
});
