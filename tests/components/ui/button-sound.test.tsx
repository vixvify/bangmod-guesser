// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { playSoundEffect } = vi.hoisted(() => ({ playSoundEffect: vi.fn() }));
vi.mock("@/lib/sound-effect", () => ({ playSoundEffect }));

import { Button } from "@/components/ui/button";

afterEach(() => {
  cleanup();
  playSoundEffect.mockReset();
});

describe("Button sound", () => {
  it("plays its optional sound and preserves the click handler", () => {
    const onClick = vi.fn();
    render(<Button sound="accept" onClick={onClick}>Play</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(playSoundEffect).toHaveBeenCalledExactlyOnceWith("accept");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("keeps ordinary and disabled buttons silent", () => {
    render(<>
      <Button>Admin action</Button>
      <Button sound="click" disabled>Disabled action</Button>
    </>);

    fireEvent.click(screen.getByRole("button", { name: "Admin action" }));
    fireEvent.click(screen.getByRole("button", { name: "Disabled action" }));
    expect(playSoundEffect).not.toHaveBeenCalled();
  });

  it("plays sound for links without dropping their click handler", () => {
    const onClick = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault());
    render(<Button href="/profile" sound="click" onClick={onClick}>Profile</Button>);

    fireEvent.click(screen.getByRole("link", { name: "Profile" }));
    expect(playSoundEffect).toHaveBeenCalledExactlyOnceWith("click");
    expect(onClick).toHaveBeenCalledOnce();
  });
});
