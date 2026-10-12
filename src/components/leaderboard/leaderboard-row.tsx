import Avatar from "@mui/material/Avatar";
import { Button } from "@/components/ui/button";
import type { LeaderboardEntry } from "@/core/domain/leaderboard";

type LeaderboardRowProps = {
  entry: LeaderboardEntry;
  current?: boolean;
};

export function LeaderboardRow({ entry, current = false }: LeaderboardRowProps) {
  return (
    <div
      data-leaderboard-rank={current ? undefined : entry.rank}
      data-leaderboard-current={current ? true : undefined}
      className={`grid grid-cols-[2rem_2.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-l-4 px-3 py-3 sm:grid-cols-[2.5rem_2.75rem_minmax(0,1fr)_auto_auto] sm:gap-4 sm:px-5 ${
        current
          ? "border-primary-main bg-leaderboard-self shadow-xl shadow-black/50"
          : "border-surface-border border-l-primary-main/40 bg-surface-control"
      }`}
    >
      <span className={`flex size-8 items-center justify-center rounded-lg text-sm font-bold tabular-nums ${current ? "bg-primary-main text-secondary-main" : "bg-primary-main/15 text-primary-light"}`}>
        {entry.rank}
      </span>
      <Avatar
        sx={{
          width: 40,
          height: 40,
          border: "1px solid color-mix(in srgb, var(--color-primary-main) 40%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--color-primary-main) 15%, var(--color-secondary-main))",
          color: "var(--color-primary-light)",
          fontSize: "0.875rem",
          fontWeight: 700,
        }}
      >
        {entry.name.charAt(0).toUpperCase()}
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-semibold text-surface-text">
          {entry.name} {current && <span className="text-primary-light">(คุณ)</span>}
        </p>
        <p className="text-xs text-surface-muted">เล่นแล้ว {entry.gamesPlayed} เกม</p>
      </div>
      <p className="text-right font-bold tabular-nums text-primary-light sm:text-lg">
        {entry.totalScore.toLocaleString("en-US")}
        <span className="block text-xs font-normal text-surface-muted sm:inline sm:pl-1">คะแนน</span>
      </p>
      {!current && (
        <Button variant="outline" size="small" disabled className="hidden sm:inline-flex">
          ดูโปรไฟล์ →
        </Button>
      )}
    </div>
  );
}
