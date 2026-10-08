// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "@/hooks/use-debounce";

function Example({ value }: { value: string }) {
  return <output>{useDebounce(value, 200)}</output>;
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useDebounce", () => {
  it("returns the latest value only after 200 ms without updates", () => {
    vi.useFakeTimers();
    const view = render(<Example value="first" />);
    view.rerender(<Example value="second" />);
    act(() => { vi.advanceTimersByTime(150); });
    view.rerender(<Example value="third" />);
    act(() => { vi.advanceTimersByTime(199); });
    expect(screen.getByText("first")).toBeTruthy();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.getByText("third")).toBeTruthy();
  });
});
