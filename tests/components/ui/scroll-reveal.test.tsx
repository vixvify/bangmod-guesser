// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const motion = vi.hoisted(() => ({ animate: vi.fn(), reduced: false }));

vi.mock("motion/react", async (importOriginal) => {
  const original = await importOriginal<typeof import("motion/react")>();
  const { useRef } = await import("react");
  return {
    ...original,
    useAnimate: () => [useRef(null), motion.animate],
    useReducedMotion: () => motion.reduced,
  };
});

const observers: FakeObserver[] = [];
class FakeObserver {
  targets = new Set<Element>();
  disconnect = vi.fn(() => this.targets.clear());
  observe = (element: Element) => this.targets.add(element);
  unobserve = (element: Element) => this.targets.delete(element);

  constructor(readonly callback: IntersectionObserverCallback) {
    observers.push(this);
  }

  enter() {
    for (const target of this.targets) {
      this.callback([{ target, isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
  }
}

beforeEach(() => {
  motion.animate.mockReset();
  motion.reduced = false;
  observers.length = 0;
  vi.stubGlobal("IntersectionObserver", FakeObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ScrollReveal", () => {
  it("reveals on first entry, avoids replaying on scroll back, and disconnects on unmount", () => {
    const { unmount } = render(<ScrollReveal>Section content</ScrollReveal>);
    expect(motion.animate).not.toHaveBeenCalled();
    // Content remains readable before JS/observation: no hidden initial style.
    expect(screen.getByText("Section content").style.opacity).toBe("");
    act(() => observers[0].enter());
    expect(motion.animate).toHaveBeenCalledOnce();
    act(() => observers[0].enter());
    expect(motion.animate).toHaveBeenCalledOnce();
    unmount();
    expect(observers[0].disconnect).toHaveBeenCalledOnce();
  });

  it("leaves content visible without animation for reduced motion", () => {
    motion.reduced = true;
    render(<ScrollReveal>Section content</ScrollReveal>);
    expect(screen.getByText("Section content").style.opacity).toBe("");
    expect(observers).toHaveLength(0);
    expect(motion.animate).not.toHaveBeenCalled();
  });

  it("keeps content readable when IntersectionObserver is unavailable", () => {
    Reflect.deleteProperty(window, "IntersectionObserver");
    render(<ScrollReveal>Section content</ScrollReveal>);
    expect(screen.getByText("Section content").style.opacity).toBe("");
    expect(motion.animate).not.toHaveBeenCalled();
  });
});
