// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScoreReveal } from "@/hooks/use-score-reveal";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("score reveal", () => {
  it("counts to the base score before adding the bonus", () => {
    const { result } = renderHook(() => useScoreReveal(4021, 300));
    expect(result.current.score).toBe(0);
    act(() => vi.advanceTimersByTime(800));
    expect(result.current.score).toBeGreaterThan(0);
    expect(result.current.score).toBeLessThan(4021);
    act(() => vi.advanceTimersByTime(800));
    expect(result.current.score).toBe(4021);
    expect(result.current.phase).toBe("base");
    act(() => vi.advanceTimersByTime(800));
    expect(result.current.score).toBeGreaterThan(4021);
    expect(result.current.phase).toBe("bonus");
    act(() => vi.advanceTimersByTime(800));
    expect(result.current.score).toBe(4321);
    expect(result.current.phase).toBe("complete");
  });

  it("shows the final score without counting when reduced motion is preferred", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const { result } = renderHook(() => useScoreReveal(4021, 300));
    act(() => vi.advanceTimersByTime(32));
    expect(result.current.score).toBe(4321);
    expect(result.current.phase).toBe("complete");
  });

  it("can skip the animation and cancels its pending frame", () => {
    const { result, unmount } = renderHook(() => useScoreReveal(4021, 300));
    act(() => result.current.skip());
    expect(result.current.score).toBe(4321);
    expect(result.current.phase).toBe("complete");
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
