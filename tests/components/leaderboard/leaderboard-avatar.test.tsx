// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LeaderboardPodium } from "@/features/leaderboard/components/leaderboard-podium";
import { LeaderboardRow } from "@/features/leaderboard/components/leaderboard-row";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("leaderboard profile images", () => {
  it("shows a player's image on the podium and in their row", async () => {
    class LoadedImage {
      onload: (() => void) | null = null;
      set src(_value: string) { queueMicrotask(() => this.onload?.()); }
    }
    vi.stubGlobal("Image", LoadedImage);
    const entry = { rank: 1, name: "Player", image: "https://example.com/player.jpg", gamesPlayed: 1, totalScore: 1000 };
    render(<><LeaderboardPodium entries={[entry]} /><LeaderboardRow entry={entry} current /></>);
    const images = await screen.findAllByRole("img", { name: "Player" });
    expect(images).toHaveLength(2);
    expect(images.every((image) => image.getAttribute("src") === entry.image)).toBe(true);
  });

  it("falls back to the user's initial without an image", () => {
    render(<LeaderboardRow entry={{ rank: 4, name: "Player", image: null, gamesPlayed: 1, totalScore: 1000 }} />);
    expect(screen.getByText("P")).toBeTruthy();
  });
});
