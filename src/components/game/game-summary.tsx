"use client";

import { useRouter } from "next/navigation";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { GameLayout } from "@/layout/game-layout";
import { GameResultMap } from "./game-result-map";
import { GameScoreReveal } from "./game-score-reveal";
import { Button } from "@/components/ui/button";
import { AppRoutes } from "@/routes/app/routes";
import { GAME_RESULT_MESSAGES as MESSAGES } from "@/core/constants/game-result";
import type { GameSummary as GameSummaryData } from "@/core/domain/game";
import { formatScore, formatTime } from "@/lib/utils";
import styles from "./game-results.module.css";

export function GameSummary({
  gameId,
  summary,
}: {
  gameId: string;
  summary: GameSummaryData;
}) {
  const router = useRouter();
  const baseScore = summary.rounds.reduce((sum, round) => sum + round.score, 0);
  const totalSeconds = summary.rounds.reduce(
    (sum, round) => sum + round.elapsedSeconds,
    0,
  );

  return (
    <GameLayout scrollable onExit={() => router.push(AppRoutes.home)}>
      <article
        data-game-id={gameId}
        className={`${styles.summary} w-full max-w-4xl`}
      >
        <div aria-hidden="true" inert className={styles.summaryMap}>
          <GameResultMap rounds={summary.rounds} showGuesses={false} />
        </div>
        <div aria-hidden="true" className={styles.summaryGlow} />
        <div className="relative px-5 pb-7 pt-12 sm:px-12 sm:pb-10">
          <div aria-hidden="true" className={styles.trophy}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 40 }} />
          </div>
          <GameScoreReveal
            baseScore={baseScore}
            bonusScore={summary.bonusScore}
            maxScore={summary.maxScore}
          />
          <dl className="mx-auto mb-7 mt-3 grid max-w-lg grid-cols-2 gap-3">
            <div className={styles.statCard}>
              <dt>
                <AccessTimeRoundedIcon fontSize="small" /> {MESSAGES.time}
              </dt>
              <dd
                aria-label={`${Math.floor(totalSeconds / 60)} นาที ${totalSeconds % 60} วินาที`}
                className="mt-2 text-2xl font-bold text-surface-text"
              >
                {formatTime(totalSeconds)}
              </dd>
            </div>
            <div className={styles.statCard}>
              <dt>{MESSAGES.bonus}</dt>
              <dd className="mt-2 text-2xl font-bold text-rank-gold">
                +{formatScore(summary.bonusScore)}
              </dd>
            </div>
          </dl>
          <div className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row">
            <Button
              href={AppRoutes.home}
              variant="outline"
              sound="click"
              className="flex-1"
            >
              <HomeRoundedIcon />
              {MESSAGES.home}
            </Button>
            <Button
              href={AppRoutes.game(gameId)}
              sound="accept"
              className="flex-1"
            >
              <ReplayRoundedIcon />
              {MESSAGES.replay}
            </Button>
          </div>
          <section
            aria-labelledby="round-breakdown-title"
            className="mt-9 border-t border-surface-border pt-6"
          >
            <h2
              id="round-breakdown-title"
              className="mb-4 text-sm font-semibold text-surface-muted"
            >
              {MESSAGES.rounds}
            </h2>
            <ol className="grid gap-2 sm:grid-cols-5">
              {summary.rounds.map((round) => (
                <li
                  key={round.round}
                  className="rounded-xl border border-surface-border bg-secondary-main/90 p-3 text-center"
                >
                  <p className="text-xs text-surface-muted">
                    รอบที่ {round.round}
                  </p>
                  <p
                    className="mt-2 truncate text-xs text-surface-text"
                    title={round.location.name}
                  >
                    {round.location.name}
                  </p>
                  <p className="mt-2 text-lg font-bold text-primary-light">
                    {formatScore(round.score)}{" "}
                    <span className="sr-only">คะแนน</span>
                  </p>
                  <p className="text-xs text-surface-muted">
                    ห่าง {round.distanceMeters} ม.
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </article>
    </GameLayout>
  );
}
