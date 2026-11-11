// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/shared/lib/http", () => ({ httpClient: api }));
vi.mock("@/features/game/game.routes", () => ({ GameRoutes: {
  roundResult: (id: string, round: number) => `/games/${id}/rounds/${round}/result`,
  summary: (id: string) => `/games/${id}/summary`,
} }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/features/game/components/game-layout", () => ({ GameLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/features/game/components/game-round-score", () => ({
  GameRoundScore: ({ result, accumulatedScore }: { result: { round: number; guess: unknown; location: { name: string } }; accumulatedScore: number }) =>
    <p>{result.round}: {result.location.name}: {result.guess === null ? "ไม่มีหมุด" : "มีหมุด"}: {accumulatedScore}</p>,
}));
vi.mock("@/features/game/components/game-summary", () => ({
  GameSummary: ({ summary }: { summary: { totalScore: number; totalTimeSeconds: number } }) => <p>{summary.totalScore} คะแนน ใน {summary.totalTimeSeconds} วินาที</p>,
}));

import { GameRoundScoreScreen } from "@/features/game/components/game-round-score-screen";
import { GameSummaryScreen } from "@/features/game/components/game-summary-screen";

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("game result API screens", () => {
  it.each([
    ["round", "สรุปคะแนนรอบนี้"],
    ["summary", "คะแนนของคุณ"],
  ])("keeps a page heading while %s data is loading or fails", async (screenType, heading) => {
    api.get.mockRejectedValueOnce(new Error("offline"));
    render(screenType === "round"
      ? <GameRoundScoreScreen gameId="g1" questionNumber={2} />
      : <GameSummaryScreen gameId="g1" />);
    expect(screen.getByRole("heading", { level: 1, name: heading })).toBeTruthy();
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1, name: heading })).toBeTruthy();
  });

  it("loads the saved round and does not show a guess marker for timeout", async () => {
    api.get.mockResolvedValueOnce({ data: { guessedLatitude: null, guessedLongitude: null, distanceMeters: null, score: 0, accumulatedScore: 123, imageUrl: null, location: { name: "หอสมุด", latitude: 13, longitude: 100, description: null } } });
    render(<GameRoundScoreScreen gameId="g1" questionNumber={2} />);
    expect(await screen.findByText("2: หอสมุด: ไม่มีหมุด: 123")).toBeTruthy();
    expect(api.get).toHaveBeenCalledWith("/games/g1/rounds/2/result");
  });

  it("loads the actual total and time for the completed game", async () => {
    api.get.mockResolvedValueOnce({ data: { baseScore: 4000, bonusScore: 300, totalScore: 4300, totalTimeSeconds: 87 } });
    render(<GameSummaryScreen gameId="g1" />);
    expect(await screen.findByText("4300 คะแนน ใน 87 วินาที")).toBeTruthy();
    expect(api.get).toHaveBeenCalledWith("/games/g1/summary");
  });
});
