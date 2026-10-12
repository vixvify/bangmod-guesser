import Avatar from "@mui/material/Avatar";
import type { LeaderboardEntry } from "@/core/domain/leaderboard";

const positionClasses: Record<number, string> = {
  1: "order-1 col-span-2 sm:order-2 sm:col-span-1 sm:-translate-y-5 sm:scale-105 sm:min-h-64",
  2: "order-2 sm:order-1",
  3: "order-3",
};

const rankStyles: Record<number, { card: string; badge: string; score: string; color: string }> = {
  1: {
    card: "border-rank-gold bg-rank-gold-card shadow-rank-gold/30",
    badge: "border-rank-gold bg-rank-gold text-secondary-main",
    score: "text-rank-gold",
    color: "var(--color-rank-gold)",
  },
  2: {
    card: "border-rank-silver bg-rank-silver-card shadow-rank-silver/20",
    badge: "border-rank-silver bg-rank-silver text-secondary-main",
    score: "text-rank-silver",
    color: "var(--color-rank-silver)",
  },
  3: {
    card: "border-rank-bronze bg-rank-bronze-card shadow-rank-bronze/20",
    badge: "border-rank-bronze bg-rank-bronze text-secondary-main",
    score: "text-rank-bronze",
    color: "var(--color-rank-bronze)",
  },
};

export function LeaderboardPodium({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <ol aria-label="สามอันดับแรก" className="mt-8 grid grid-cols-2 items-end gap-3 sm:grid-cols-3 sm:gap-5">
      {entries.map((entry) => (
        <li
          key={entry.rank}
          data-leaderboard-rank={entry.rank}
          className={`relative flex min-w-0 flex-col items-center justify-center rounded-2xl border-2 border-t-[6px] px-3 pb-6 pt-8 text-center shadow-2xl sm:min-h-56 sm:px-5 ${rankStyles[entry.rank]?.card ?? "border-surface-border bg-surface-overlay"} ${positionClasses[entry.rank] ?? ""}`}
        >
          <span className={`absolute -top-4 rounded-full border-2 px-4 py-1 text-sm font-extrabold shadow-lg ${rankStyles[entry.rank]?.badge ?? "border-surface-border bg-secondary-main text-surface-text"}`}>
            #{entry.rank}
          </span>
          <Avatar
            sx={{
              width: entry.rank === 1 ? 80 : 64,
              height: entry.rank === 1 ? 80 : 64,
              border: `3px solid ${rankStyles[entry.rank]?.color ?? "var(--color-surface-control-border)"}`,
              backgroundColor: "var(--color-secondary-main)",
              color: "var(--color-surface-text)",
              fontWeight: 700,
            }}
          >
            {entry.name.charAt(0).toUpperCase()}
          </Avatar>
          <h2 className="mt-3 max-w-full truncate text-base font-bold sm:text-lg">{entry.name}</h2>
          <p className="text-xs text-surface-muted">เล่นแล้ว {entry.gamesPlayed} เกม</p>
          <p className={`mt-3 font-bold tabular-nums ${entry.rank === 1 ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"} ${rankStyles[entry.rank]?.score ?? "text-surface-text"}`}>
            {entry.totalScore.toLocaleString("en-US")}
          </p>
          <span className="text-xs text-surface-muted">คะแนน</span>
        </li>
      ))}
    </ol>
  );
}
