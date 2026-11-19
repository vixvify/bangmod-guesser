"use client";

import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import type { LeaderboardEntry } from "@/features/leaderboard/leaderboard";
import { getProfileImageUrl } from "@/shared/lib/profile-image";
import { AppRoutes } from "@/shared/routes/routes";
import { playSoundEffect } from "@/shared/lib/sound-effect";

const positionClasses: Record<number, string> = {
  1: "order-1 col-span-2 sm:order-2 sm:col-span-1 sm:-translate-y-5 sm:scale-105 sm:min-h-64",
  2: "order-2 sm:order-1",
  3: "order-3",
};

const rankStyles: Record<number, { card: string; badge: string; score: string }> = {
  1: {
    card: "border-rank-gold bg-rank-gold-card shadow-rank-gold/30 [--podium-accent:var(--color-rank-gold)]",
    badge: "border-rank-gold bg-rank-gold text-secondary-main",
    score: "text-rank-gold",
  },
  2: {
    card: "border-rank-silver bg-rank-silver-card shadow-rank-silver/20 [--podium-accent:var(--color-rank-silver)]",
    badge: "border-rank-silver bg-rank-silver text-secondary-main",
    score: "text-rank-silver",
  },
  3: {
    card: "border-rank-bronze bg-rank-bronze-card shadow-rank-bronze/20 [--podium-accent:var(--color-rank-bronze)]",
    badge: "border-rank-bronze bg-rank-bronze text-secondary-main",
    score: "text-rank-bronze",
  },
};

export function LeaderboardPodium({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <ol aria-label="สามอันดับแรก" className="mt-8 grid grid-cols-2 items-end gap-x-3 gap-y-7 sm:mt-14 sm:grid-cols-3 sm:gap-5">
      {entries.map((entry) => (
        <li
          key={entry.rank}
          data-leaderboard-rank={entry.rank}
          className={`leaderboard-podium-card relative flex min-w-0 flex-col items-center justify-center rounded-2xl border-2 border-t-[6px] px-3 py-5 text-center shadow-2xl sm:min-h-56 sm:px-5 sm:pb-6 sm:pt-8 ${rankStyles[entry.rank]?.card ?? "border-surface-border bg-surface-overlay"} ${positionClasses[entry.rank] ?? ""}`}
        >
          <span className={`absolute -top-4 z-10 inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm font-extrabold shadow-lg ${rankStyles[entry.rank]?.badge ?? "border-surface-border bg-secondary-main text-surface-text"}`}>
            {entry.rank === 1 ? (
              <EmojiEventsRoundedIcon aria-hidden="true" fontSize="inherit" />
            ) : (
              <WorkspacePremiumRoundedIcon aria-hidden="true" fontSize="inherit" />
            )}
            <span className="sr-only">อันดับ </span>
            #{entry.rank}
          </span>
          <div className={`leaderboard-podium-avatar relative px-6 py-1 sm:py-2 ${rankStyles[entry.rank]?.score ?? "text-surface-text"}`}>
            <Avatar
              src={getProfileImageUrl(entry.image)}
              alt={entry.name}
              sx={{
                width: entry.rank === 1 ? { xs: 64, sm: 80 } : { xs: 52, sm: 64 },
                height: entry.rank === 1 ? { xs: 64, sm: 80 } : { xs: 52, sm: 64 },
                border: "3px solid var(--podium-accent, var(--color-surface-control-border))",
                backgroundColor: "var(--color-secondary-main)",
                color: "var(--color-surface-text)",
                fontWeight: 700,
              }}
            >
              {entry.name.charAt(0).toUpperCase()}
            </Avatar>
            {entry.rank === 1 && (
              <>
                <span aria-hidden className="absolute left-1 top-1/3 text-xl motion-safe:animate-home-enter">✦</span>
                <span aria-hidden className="absolute right-1 top-1/2 text-sm motion-safe:animate-home-enter motion-safe:[animation-delay:120ms]">✦</span>
              </>
            )}
          </div>
          <h2 className="mt-2 max-w-full truncate text-base font-bold sm:mt-3 sm:text-lg">{entry.name}</h2>
          <p className="text-xs text-surface-muted">เล่นแล้ว {entry.gamesPlayed} เกม</p>
          <p className={`mt-2 font-bold tabular-nums sm:mt-3 ${entry.rank === 1 ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"} ${rankStyles[entry.rank]?.score ?? "text-surface-text"}`}>
            {entry.totalScore.toLocaleString("en-US")}
          </p>
          <span className="text-xs text-surface-muted">คะแนน</span>
          <Tooltip title={`ดูโปรไฟล์ของ ${entry.name}`}>
            <Link
              href={AppRoutes.userProfile(entry.userId)}
              onClick={() => playSoundEffect("click")}
              className="absolute bottom-2.5 right-2.5 z-10 flex size-8 items-center justify-center rounded-lg border border-surface-border/70 bg-surface-overlay/80 text-surface-muted shadow-sm transition hover:border-surface-control-border hover:bg-surface-control hover:text-surface-text focus-visible:outline-2 focus-visible:outline-primary-focus motion-safe:hover:scale-110 sm:bottom-3 sm:right-3"
            >
              <PersonOutlineIcon sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }} />
            </Link>
          </Tooltip>
        </li>
      ))}
    </ol>
  );
}
