// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BackgroundSlideshow } from "@/components/home/slideshow";
import { HomeBackgroundImages } from "@/core/constants/home";

function getActiveImageSource(container: HTMLElement) {
  const source = container.querySelector("img.opacity-75")?.getAttribute("src");

  return source ? decodeURIComponent(source) : null;
}

describe("BackgroundSlideshow", () => {
  beforeEach(() => {
    vi.spyOn(document, "hasFocus").mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renders each configured campus scene with the pixel tone treatment", () => {
    const { container } = render(<BackgroundSlideshow />);

    expect(container.querySelectorAll("img")).toHaveLength(
      HomeBackgroundImages.length,
    );
    expect(getActiveImageSource(container)).toContain(HomeBackgroundImages[0]);
    expect(container.querySelector("filter#campus-tones")).toBeTruthy();
    expect(container.querySelector("[class*='bg-size-[0.1875rem_0.1875rem]']")).toBeTruthy();
  });

  it("advances to the next image and wraps to the first image", () => {
    vi.useFakeTimers();
    const { container } = render(<BackgroundSlideshow />);

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(getActiveImageSource(container)).toContain(HomeBackgroundImages[1]);

    act(() => {
      vi.advanceTimersByTime(6000 * (HomeBackgroundImages.length - 1));
    });

    expect(getActiveImageSource(container)).toContain(HomeBackgroundImages[0]);
  });

  it.each(["hidden", "unfocused"])("restarts the current zoom and preserves slide time after being %s", (reason) => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "requestAnimationFrame",
      (callback: FrameRequestCallback) => window.setTimeout(callback, 0),
    );
    vi.stubGlobal("cancelAnimationFrame", window.clearTimeout);
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    const { container } = render(<BackgroundSlideshow />);
    const animation = { cancel: vi.fn() };
    Object.defineProperty(container.firstElementChild, "getAnimations", {
      value: () => [animation],
    });

    act(() => vi.advanceTimersByTime(1));
    expect(container.querySelector("img.opacity-75")?.classList.contains("scale-[1.08]")).toBe(true);
    act(() => vi.advanceTimersByTime(2000));
    act(() => {
      if (reason === "hidden") {
        hidden.mockReturnValue(true);
        document.dispatchEvent(new Event("visibilitychange"));
      } else {
        vi.mocked(document.hasFocus).mockReturnValue(false);
        window.dispatchEvent(new Event("blur"));
      }
    });
    expect(animation.cancel).toHaveBeenCalledOnce();
    expect(container.querySelector("img.opacity-75")?.classList.contains("scale-100")).toBe(true);
    act(() => vi.advanceTimersByTime(120000));
    expect(getActiveImageSource(container)).toContain(HomeBackgroundImages[0]);

    act(() => {
      hidden.mockReturnValue(false);
      vi.mocked(document.hasFocus).mockReturnValue(true);
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event("focus"));
    });
    act(() => vi.advanceTimersByTime(1));
    expect(container.querySelector("img.opacity-75")?.classList.contains("scale-[1.08]")).toBe(true);
    act(() => vi.advanceTimersByTime(3997));
    expect(getActiveImageSource(container)).toContain(HomeBackgroundImages[0]);
    act(() => vi.advanceTimersByTime(1));
    expect(getActiveImageSource(container)).toContain(HomeBackgroundImages[1]);
  });

  it("cleans up its clock and does not restart on focus after unmount", () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const { unmount } = render(<BackgroundSlideshow />);

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    window.dispatchEvent(new Event("focus"));
    document.dispatchEvent(new Event("visibilitychange"));
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps the outgoing image zoomed while the next image begins a new zoom", () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "requestAnimationFrame",
      (callback: FrameRequestCallback) => window.setTimeout(callback, 0),
    );
    vi.stubGlobal("cancelAnimationFrame", window.clearTimeout);
    const { container } = render(<BackgroundSlideshow />);
    const images = container.querySelectorAll("img");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(images[0].classList.contains("opacity-0")).toBe(true);
    expect(images[0].classList.contains("scale-[1.08]")).toBe(true);
    expect(images[1].classList.contains("scale-[1.08]")).toBe(true);
    expect(images[1].classList.contains("transition-[opacity,scale]")).toBe(true);
    expect(images[1].style.transitionDuration).toBe("1600ms, 7600ms");
    expect(images[0].style.transitionDuration).toBe("1600ms, 7600ms");

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(images[0].classList.contains("scale-100")).toBe(true);
  });
});
