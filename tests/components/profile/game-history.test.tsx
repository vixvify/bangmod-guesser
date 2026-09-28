// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { mockGameHistory } from "@/_mock/_profile";
import { GameHistory } from "@/components/profile/game-history";

afterEach(cleanup);

describe("GameHistory", () => {
  it("renders the games supplied by the page", () => {
    render(<GameHistory games={mockGameHistory} />);

    expect(screen.getByText("#GAME-0001")).toBeTruthy();
    expect(screen.getByText("#GAME-0004")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("shows an empty state when no games are supplied", () => {
    render(<GameHistory games={[]} />);
    expect(screen.getByText("ไม่พบประวัติการเล่นในช่วงเวลานี้")).toBeTruthy();
    expect(screen.queryByText("#GAME-0001")).toBeNull();
  });
});
