// @vitest-environment jsdom

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LobbyFx } from "@/components/home/lobby-fx";

const fillRect = vi.fn();
const clearRect = vi.fn();
const disconnect = vi.fn();
const motionPreference = {
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};
const frame = { callback: undefined as FrameRequestCallback | undefined };

describe("LobbyFx", () => {
  beforeEach(() => {
    motionPreference.matches = false;
    frame.callback = undefined;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      fillRect, clearRect, globalAlpha: 1, fillStyle: "",
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(360);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(720);
    vi.stubGlobal("matchMedia", () => motionPreference);
    vi.stubGlobal("ResizeObserver", class {
      observe = vi.fn();
      disconnect = disconnect;
    });
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      frame.callback = callback;
      return 42;
    }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("draws pixel blocks at the parent size without intercepting controls", () => {
    const { container } = render(<LobbyFx />);
    const canvas = container.querySelector("canvas");
    expect(canvas?.width).toBe(360);
    expect(canvas?.height).toBe(720);
    expect(canvas?.getAttribute("aria-hidden")).toBe("true");
    expect(canvas?.className).toContain("pointer-events-none");
    expect(fillRect).toHaveBeenCalled();
    expect(requestAnimationFrame).toHaveBeenCalledOnce();
  });

  it("keeps a static pixel background when reduced motion is enabled", () => {
    motionPreference.matches = true;
    render(<LobbyFx />);
    expect(fillRect).toHaveBeenCalled();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("stops rendering when the document is hidden and resumes when visible", () => {
    render(<LobbyFx />);
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    vi.mocked(requestAnimationFrame).mockClear();
    fireEvent(document, new Event("visibilitychange"));
    expect(cancelAnimationFrame).toHaveBeenLastCalledWith(42);
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    hidden.mockReturnValue(false);
    fireEvent(document, new Event("visibilitychange"));
    expect(requestAnimationFrame).toHaveBeenCalledOnce();
  });

  it("releases the animation, observer and interaction listeners on unmount", () => {
    const { container, unmount } = render(<LobbyFx />);
    const removeListener = vi.spyOn(container, "removeEventListener");
    unmount();
    expect(cancelAnimationFrame).toHaveBeenLastCalledWith(42);
    expect(disconnect).toHaveBeenCalledOnce();
    expect(removeListener).toHaveBeenCalledWith("pointerdown", expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith("pointermove", expect.any(Function));
    expect(motionPreference.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("leaves the page usable when a canvas context is unavailable", () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    expect(() => render(<LobbyFx />)).not.toThrow();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });
});
