// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BackgroundSlideshow } from "@/components/home/background-slideshow";
import { HomeBackgroundImages } from "@/lib/data";

function getActiveImageSource(container: HTMLElement) {
  const source = container
    .querySelector("img.opacity-75")
    ?.getAttribute("src");

  return source ? decodeURIComponent(source) : null;
}

describe("BackgroundSlideshow", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders every configured image and zooms the active image", () => {
    const { container } = render(<BackgroundSlideshow />);

    expect(container.querySelectorAll("img")).toHaveLength(HomeBackgroundImages.length);
    expect(getActiveImageSource(container)).toContain(HomeBackgroundImages[0]);
    expect(container.querySelector("img.animate-home-background-zoom")?.className).toContain(
      "transition-opacity",
    );
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

  it("clears its interval when unmounted", () => {
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    const { unmount } = render(<BackgroundSlideshow />);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalledOnce();
  });

  it("keeps zoom on the outgoing image throughout the fade and resets it only while hidden", () => {
    vi.useFakeTimers();
    const { container } = render(<BackgroundSlideshow />);
    const images = container.querySelectorAll("img");
    act(() => { vi.advanceTimersByTime(6000); });
    expect(images[0].classList.contains("opacity-0")).toBe(true);
    expect(images[0].classList.contains("animate-home-background-zoom")).toBe(true);
    expect(images[1].classList.contains("animate-home-background-zoom")).toBe(true);
    act(() => { vi.advanceTimersByTime(1600); });
    expect(images[0].classList.contains("animate-home-background-zoom")).toBe(true);
    act(() => { vi.advanceTimersByTime(4400); });
    expect(images[0].classList.contains("animate-home-background-zoom")).toBe(false);
    expect(images[0].classList.contains("opacity-0")).toBe(true);
  });
});
