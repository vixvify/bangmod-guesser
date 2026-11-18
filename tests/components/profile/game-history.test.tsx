// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { mockGameHistory } from "@/features/profile/profile.mock";
import { GameHistory } from "@/features/profile/components/game-history";

afterEach(cleanup);

describe("GameHistory", () => {
  it("renders the games supplied by the page", () => {
    const { container } = render(<GameHistory games={mockGameHistory} />);

    expect(container.querySelector("li")?.className).toContain("bg-surface-overlay");
    expect(screen.queryByText("#GAME-0001")).toBeNull();
    expect(screen.getAllByText("เล่นจบแล้ว")).toHaveLength(4);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText("ระดับ SSS")).toBeTruthy();
    expect(screen.getByText("ระดับ S")).toBeTruthy();
    expect(screen.getAllByText("ระดับ A")).toHaveLength(2);
  });

  it("shows unfinished games without inventing a total score or displaying the ID", () => {
    render(<GameHistory games={[{ ...mockGameHistory[0], id: "unfinished", status: "INCOMPLETE", totalScore: null, grade: null }]} />);
    expect(screen.getByText("ออกกลางคัน")).toBeTruthy();
    expect(screen.getByText("—")).toBeTruthy();
    expect(screen.queryByText("#unfinished")).toBeNull();
    expect(screen.queryByTestId("rank-tier")).toBeNull();
  });

  it("renders rank tier for completed games with 0 score", () => {
    render(<GameHistory games={[{ ...mockGameHistory[0], id: "zero-score", totalScore: 0, grade: "D" }]} />);
    expect(screen.getByText("ระดับ D")).toBeTruthy();
  });

  it("calculates rank tier dynamically when grade is not pre-computed but totalScore exists", () => {
    render(<GameHistory games={[{ ...mockGameHistory[0], id: "dynamic", totalScore: 2600, grade: null }]} />);
    expect(screen.getByText("ระดับ B")).toBeTruthy();
  });

  it("shows an empty state when no games are supplied", () => {
    render(<GameHistory games={[]} />);
    expect(screen.getByText("ไม่พบประวัติการเล่นในช่วงเวลานี้")).toBeTruthy();
    expect(screen.queryByText("#GAME-0001")).toBeNull();
  });
});
