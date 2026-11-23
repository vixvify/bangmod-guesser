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
  1: "sm:order-2 sm:-translate-y-5 sm:scale-105 sm:min-h-64",
  2: "sm:order-1",
  3: "sm:order-3",
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
    <ol aria-label="สามอันดับแรก" className="mt-5 grid grid-cols-1 gap-2 sm:mt-14 sm:grid-cols-3 sm:items-end sm:gap-5">
      {entries.map((entry) => (
        <li
          key={entry.rank}
          data-leaderboard-rank={entry.rank}
          className={`leaderboard-podium-card relative grid min-w-0 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 rounded-2xl border-2 border-l-4 px-2.5 py-3 shadow-2xl sm:flex sm:min-h-56 sm:flex-col sm:justify-center sm:gap-0 sm:border-l-2 sm:border-t-[6px] sm:px-5 sm:pb-6 sm:pt-8 sm:text-center ${rankStyles[entry.rank]?.card ?? "border-surface-border bg-surface-overlay"} ${positionClasses[entry.rank] ?? ""}`}
        >
          <span className={`row-span-2 inline-flex size-8 items-center justify-center rounded-full border-2 text-xs font-extrabold shadow-lg sm:absolute sm:-top-4 sm:z-10 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-1 sm:text-sm ${rankStyles[entry.rank]?.badge ?? "border-surface-border bg-secondary-main text-surface-text"}`}>
            <span className="hidden sm:inline-flex">
              {entry.rank === 1 ? (
                <EmojiEventsRoundedIcon aria-hidden="true" fontSize="inherit" />
              ) : (
                <WorkspacePremiumRoundedIcon aria-hidden="true" fontSize="inherit" />
              )}
            </span>
            <span className="sr-only">อันดับ </span>
            #{entry.rank}
          </span>
          <div className="col-start-2 row-start-1 flex min-w-0 max-w-full items-center gap-2 sm:flex-col sm:gap-0">
            <div className={`leaderboard-podium-avatar relative shrink-0 sm:px-6 sm:py-2 ${rankStyles[entry.rank]?.score ?? "text-surface-text"}`}>
              <Avatar
                src={getProfileImageUrl(entry.image)}
                alt={entry.name}
                sx={{
                  width: { xs: 32, sm: entry.rank === 1 ? 80 : 64 },
                  height: { xs: 32, sm: entry.rank === 1 ? 80 : 64 },
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
                  <span aria-hidden className="absolute left-1 top-1/3 hidden text-xl motion-safe:animate-home-enter sm:inline">✦</span>
                  <span aria-hidden className="absolute right-1 top-1/2 hidden text-sm motion-safe:animate-home-enter motion-safe:[animation-delay:120ms] sm:inline">✦</span>
                </>
              )}
            </div>
            <div className="min-w-0 max-w-full">
              <h2 className="truncate text-sm font-bold sm:mt-3 sm:text-lg">{entry.name}</h2>
              <p className="text-xs text-surface-muted">เล่นแล้ว {entry.gamesPlayed} เกม</p>
            </div>
          </div>
          <p className={`col-start-2 row-start-2 min-w-0 max-w-full wrap-anywhere pl-10 text-sm font-bold tabular-nums sm:mt-3 sm:pl-0 ${entry.rank === 1 ? "sm:text-3xl" : "sm:text-2xl"} ${rankStyles[entry.rank]?.score ?? "text-surface-text"}`}>
            {entry.totalScore.toLocaleString("en-US")}
            <span className="ml-1 text-xs font-normal text-surface-muted sm:ml-0 sm:block">คะแนน</span>
          </p>
          <Tooltip title={`ดูโปรไฟล์ของ ${entry.name}`}>
            <Link
              href={AppRoutes.userProfile(entry.userId)}
              onClick={() => playSoundEffect("click")}
              className="col-start-3 row-span-2 row-start-1 z-10 flex size-9 items-center justify-center rounded-lg border border-surface-border/70 bg-surface-overlay/80 text-surface-muted shadow-sm transition hover:border-surface-control-border hover:bg-surface-control hover:text-surface-text focus-visible:outline-2 focus-visible:outline-primary-focus motion-safe:hover:scale-110 sm:mt-2 lg:absolute lg:bottom-3 lg:right-3 lg:mt-0"
            >
              <PersonOutlineIcon sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }} />
            </Link>
          </Tooltip>
        </li>
      ))}
    </ol>
  );
}
