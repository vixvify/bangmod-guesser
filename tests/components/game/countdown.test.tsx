// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Countdown } from "@/shared/components/ui/countdown";

const playSoundEffect = vi.hoisted(() => vi.fn());
vi.mock("@/shared/lib/sound-effect", () => ({ playSoundEffect }));

afterEach(() => { cleanup(); vi.useRealTimers(); vi.clearAllMocks(); });

it("plays click for 3, 2 and 1, then accept when the countdown finishes", () => {
  vi.useFakeTimers();
  const complete = vi.fn();
  render(<Countdown onComplete={complete} />);
  expect(playSoundEffect.mock.calls).toEqual([["click"]]);
  act(() => vi.advanceTimersByTime(3000));
  expect(playSoundEffect.mock.calls).toEqual([["click"], ["click"], ["click"], ["accept"]]);
  act(() => vi.advanceTimersByTime(700));
  expect(complete).toHaveBeenCalledOnce();
});
