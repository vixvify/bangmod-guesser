// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LobbyMenu } from "@/components/home/lobby-menu";
import { mockDialog } from "../../helpers/dialog";
import { Countdown } from "@/components/ui/countdown";

const { push, router } = vi.hoisted(() => {
  const push = vi.fn();
  return { push, router: { push } };
});
vi.mock("next/navigation", () => ({ useRouter: () => router }));

beforeEach(() => {
  push.mockReset();
  return mockDialog();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("LobbyMenu", () => {
  it("starts one countdown and navigates to the game only after three seconds", () => {
    vi.useFakeTimers();
    render(<LobbyMenu />);
    const play = screen.getByRole<HTMLButtonElement>("button", {
      name: "Play Bangmod Guesser",
    });

    expect(play.disabled).toBe(false);
    fireEvent.click(play);
    expect(play.disabled).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("3");
    fireEvent.click(play);
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(push).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(push).toHaveBeenCalledExactlyOnceWith("/game");
  });

  it("opens instructions on demand with a native dialog close action", async () => {
    // jsdom does not implement the browser's modal top layer.
    const user = userEvent.setup();
    const { container } = render(<LobbyMenu />);
    const dialog = container.querySelector("dialog");
    if (!dialog) throw new Error("Instructions dialog is missing");
    const showModal = vi.fn(() => {
      dialog.open = true;
    });
    Object.defineProperty(dialog, "showModal", {
      value: showModal,
      configurable: true,
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: /วิธีเล่น/ }));

    expect(showModal).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("dialog", { name: "จำมุมนี้ได้ไหม?" }),
    ).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(
      screen
        .getByRole("button", { name: "เข้าใจแล้ว" })
        .closest("form")
        ?.getAttribute("method"),
    ).toBe("dialog");
  });
});

describe("Countdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  it("shows 3 initially then counts down to 1", () => {
    render(<Countdown onComplete={vi.fn()} />);

    expect(screen.getByRole("status").textContent).toBe("3");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("status").textContent).toBe("2");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("status").textContent).toBe("1");
  });

  it("calls onComplete after three seconds", () => {
    const onComplete = vi.fn();

    render(<Countdown onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(2999);
    });

    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(onComplete).toHaveBeenCalledOnce();
    expect(screen.getByRole("status").textContent).toBe("ไปกันเลย!");
  });

  it("prevents closing the countdown with escape", () => {
    render(<Countdown onComplete={vi.fn()} />);

    const dialog = screen.getByRole("dialog");

    const event = new Event("cancel", {
      bubbles: true,
      cancelable: true,
    });

    dialog.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("clears timers when unmounted", () => {
    const onComplete = vi.fn();

    const { unmount } = render(<Countdown onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});
