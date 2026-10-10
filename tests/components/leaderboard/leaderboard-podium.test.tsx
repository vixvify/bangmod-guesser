import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { leaderboardEntries } from "@/_mock/_leaderboard";
import { LeaderboardPodium } from "@/components/leaderboard/leaderboard-podium";

describe("LeaderboardPodium", () => {
  it("distinguishes first, second, and third with gold, silver, and bronze", () => {
    const markup = renderToStaticMarkup(
      <LeaderboardPodium entries={leaderboardEntries.slice(0, 3)} />,
    );

    expect(markup).toMatch(/data-leaderboard-rank="1"[^>]*class="[^"]*border-rank-gold/);
    expect(markup).toMatch(/data-leaderboard-rank="2"[^>]*class="[^"]*border-rank-silver/);
    expect(markup).toMatch(/data-leaderboard-rank="3"[^>]*class="[^"]*border-rank-bronze/);
    expect(markup).toContain("bg-rank-gold-card");
    expect(markup).toContain("bg-rank-silver-card");
    expect(markup).toContain("bg-rank-bronze-card");
    expect(markup).toContain("sm:scale-105");
  });
});
