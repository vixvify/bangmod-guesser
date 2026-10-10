import { currentPlayerRank, leaderboardEntries } from "@/_mock/_leaderboard";
import { LeaderboardPodium } from "@/components/leaderboard/leaderboard-podium";
import { LeaderboardRow } from "@/components/leaderboard/leaderboard-row";
import { MainLayout } from "@/layout/main-layout";
import { requireAuth } from "@/lib/auth-check";

export default async function LeaderboardPage() {
  const user = await requireAuth();

  return (
    <MainLayout
      user={user}
      variant="contained"
      brandColor="var(--color-surface-text)"
      className="relative min-h-svh bg-secondary-main text-surface-text"
    >
      <section
        aria-labelledby="leaderboard-title"
        className="flex min-h-[calc(100svh-12rem)] flex-col rounded-3xl border border-surface-border bg-linear-to-b from-primary-main/10 via-surface-overlay to-surface-overlay p-4 shadow-2xl shadow-black/20 sm:p-6 lg:p-9"
      >
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rank-gold">
            Leaderboard · Top 10
          </p>
          <h1
            id="leaderboard-title"
            className="mt-2 text-3xl font-bold sm:text-4xl"
          >
            อันดับผู้เล่น
          </h1>
          <p className="mt-2 text-sm text-surface-muted">
            ผู้เล่นที่ทำคะแนนรวมสูงสุด
          </p>
        </header>

        <LeaderboardPodium entries={leaderboardEntries.slice(0, 3)} />

        <ol start={4} aria-label="อันดับ 4 ถึง 10" className="mt-5 space-y-2">
          {leaderboardEntries.slice(3).map((entry) => (
            <li key={entry.rank}>
              <LeaderboardRow entry={entry} />
            </li>
          ))}
        </ol>

        <aside
          aria-label="อันดับของคุณ"
          className="sticky bottom-4 z-20 mt-auto pt-5"
        >
          <LeaderboardRow
            entry={{ ...currentPlayerRank, name: user.name }}
            current
          />
        </aside>
      </section>
    </MainLayout>
  );
}
