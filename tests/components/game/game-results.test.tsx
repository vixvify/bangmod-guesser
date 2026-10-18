// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GameRoundScore } from "@/components/game/game-round-score";
import { GameSummary } from "@/components/game/game-summary";
import { mockRoundResult, mockGameSummary } from "@/_mock/_game";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/components/game/game-result-map", () => ({ GameResultMap: () => <div>Map</div> }));
vi.mock("next/image", () => ({ default: ({ fill, sizes, ...props }: Record<string, unknown>) => {
  void fill; void sizes;
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img {...props} />;
} }));

beforeEach(() => { vi.stubGlobal("matchMedia", () => ({ matches: true })); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("game results", () => {
  it("opens location information by keyboard, traps focus, and returns focus after Escape", async () => {
    const user = userEvent.setup();
    render(<GameRoundScore gameId="game-123" result={mockRoundResult} totalRounds={5} accumulatedScore={1111} />);
    const trigger = screen.getByRole("button", { name: `รายละเอียดสถานที่ ${mockRoundResult.location.name}` });
    trigger.focus();
    await user.keyboard("{Enter}");
    const modal = screen.getByRole("dialog", { name: mockRoundResult.location.name });
    expect(within(modal).getByText(mockRoundResult.location.description!)).toBeTruthy();
    await user.tab();
    expect(modal.contains(document.activeElement)).toBe(true);
    await user.tab({ shift: true });
    expect(modal.contains(document.activeElement)).toBe(true);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(screen.getByRole("link", { name: /รอบถัดไป/ }).getAttribute("href")).toBe("/game/game-123");
  });

  it("links the last round to the summary", () => {
    render(<GameRoundScore gameId="game-123" result={{ ...mockRoundResult, round: 5 }} totalRounds={5} accumulatedScore={4021} />);
    expect(screen.queryByRole("link", { name: /รอบถัดไป/ })).toBeNull();
    expect(screen.getByRole("link", { name: /สรุปผลเกม/ }).getAttribute("href")).toBe("/game/game-123/summary");
  });

  it("shows final totals and starts a countdown before replay", async () => {
    render(<GameSummary gameId="game-123" summary={mockGameSummary} />);
    expect(screen.getByRole("meter").getAttribute("aria-valuenow")).toBe("4321");
    expect(screen.getByRole("meter").getAttribute("aria-valuemax")).toBe(String(mockGameSummary.maxScore));
    expect(screen.getByText("01:27")).toBeTruthy();
    await userEvent.setup().click(screen.getByRole("button", { name: /เล่นอีกครั้ง/ }));
    expect(screen.getByRole("dialog", { name: "กำลังเข้าสู่เกม" })).toBeTruthy();
    expect(await screen.findByText(/คะแนนจากการทาย 4,021 คะแนน โบนัส 300 คะแนน รวม 4,321/)).toBeTruthy();
  });
});
