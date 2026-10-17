// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GameMap } from "@/components/game/game-map";

afterEach(cleanup);

describe("game map keyboard access", () => {
  it("selects the map center with Enter without requiring a pointer", () => {
    const onMapClick = vi.fn();
    render(<GameMap latitude={13.6513} longitude={100.4943} markerPosition={null} onMapClick={onMapClick} />);
    const map = screen.getByRole("region", { name: "แผนที่เลือกคำตอบ" });
    expect(map.tabIndex).toBe(0);
    expect(document.getElementById(map.getAttribute("aria-describedby")!)?.textContent).toContain("Enter");
    fireEvent.keyDown(map, { key: "Enter" });
    expect(onMapClick).toHaveBeenCalledWith(13.6513, 100.4943);
  });

  it("offers a named button and announces the selected coordinates", () => {
    const onMapClick = vi.fn();
    render(<GameMap latitude={13.6513} longitude={100.4943} markerPosition={{ lat: 13.65, lng: 100.49 }} onMapClick={onMapClick} />);
    fireEvent.click(screen.getByRole("button", { name: "ปักหมุดกลางแผนที่" }));
    expect(onMapClick).toHaveBeenCalledOnce();
    expect(screen.getByRole("status").textContent).toContain("13.65000, 100.49000");
    expect(screen.getByRole("button", { name: "ขยายแผนที่" })).toBeTruthy();
  });
});
