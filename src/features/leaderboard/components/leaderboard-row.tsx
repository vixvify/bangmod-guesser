import Avatar from "@mui/material/Avatar";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import type { LeaderboardEntry } from "@/features/leaderboard/leaderboard";
import { getProfileImageUrl } from "@/shared/lib/profile-image";
import { AppRoutes } from "@/shared/routes/routes";

type LeaderboardRowProps = {
  entry: LeaderboardEntry;
  current?: boolean;
  leadingScore?: number;
};

export function LeaderboardRow({ entry, current = false, leadingScore = 0 }: LeaderboardRowProps) {
  const pointsBehind = leadingScore - entry.totalScore;
  const scorePercent = leadingScore > 0
    ? Math.max(0, Math.min(100, entry.totalScore / leadingScore * 100))
    : 0;

  return (
    <div
      data-leaderboard-rank={current ? undefined : entry.rank}
      data-leaderboard-current={current ? true : undefined}
      className={`grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1 rounded-xl border border-l-4 px-2.5 py-2.5 sm:grid-cols-[2.5rem_2.75rem_minmax(0,1fr)_auto_auto] sm:gap-4 sm:px-5 sm:py-3 ${
        current
          ? "border-primary-main bg-leaderboard-self shadow-xl shadow-black/50"
          : "border-surface-border border-l-primary-main/40 bg-surface-control transition-colors hover:bg-surface-control-hover focus-within:bg-surface-control-hover"
      }`}
    >
      <span className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-1 text-xs font-bold tabular-nums sm:text-sm ${current ? "bg-primary-main text-secondary-main" : "bg-primary-main/15 text-primary-light"}`}>
        {entry.rank}
      </span>
      <Avatar
        src={getProfileImageUrl(entry.image)}
        alt={entry.name}
        sx={{
          width: { xs: 32, sm: 40 },
          height: { xs: 32, sm: 40 },
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
        {current ? <p className="truncate font-semibold text-surface-text">{entry.name} <span className="text-primary-light">(คุณ)</span></p> : <Link href={AppRoutes.userProfile(entry.userId)} className="block truncate font-semibold text-surface-text hover:text-primary-light" aria-label={`ดูโปรไฟล์ของ ${entry.name}`}>{entry.name}</Link>}
        <p className="text-xs text-surface-muted">เล่นแล้ว {entry.gamesPlayed} เกม</p>
        {current && pointsBehind > 0 && (
          <p className="mt-0.5 text-xs text-primary-light">
            ตามอันดับ 1 อีก {pointsBehind.toLocaleString("en-US")} คะแนน
          </p>
        )}
      </div>
      <div className="col-start-3 min-w-0 sm:col-start-auto">
        <p className="text-right font-bold tabular-nums text-primary-light sm:text-lg">
          {entry.totalScore.toLocaleString("en-US")}
          <span className="pl-1 text-xs font-normal text-surface-muted">คะแนน</span>
        </p>
        {leadingScore > 0 && (
          <div aria-hidden="true" className="ml-auto mt-1.5 h-1 w-full max-w-24 overflow-hidden rounded-full bg-surface-control">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary-main to-rank-gold"
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        )}
      </div>
      {!current && (
        <Button
          href={AppRoutes.userProfile(entry.userId)}
          variant="outline"
          size="small"
          sound="click"
          className="hidden sm:inline-flex"
        >
          ดูโปรไฟล์ →
        </Button>
      )}
    </div>
  );
}
