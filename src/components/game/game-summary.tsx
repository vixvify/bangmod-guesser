"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { GameLayout } from "@/layout/game-layout";
import { GameScoreReveal } from "./game-score-reveal";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
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
  const [isStarting, setIsStarting] = useState(false);
  const totalSeconds = summary.rounds.reduce(
    (sum, round) => sum + round.elapsedSeconds,
    0,
  );

  const enterGame = useCallback(
    () => router.push(AppRoutes.game(gameId)),
    [gameId, router],
  );

  return (
    <GameLayout scrollable onExit={() => router.push(AppRoutes.home)}>
      <article
        data-game-id={gameId}
        className={`${styles.summary} w-full max-w-4xl`}
      >
        <div aria-hidden="true" className={styles.summaryGlow} />
        <div className="relative px-5 pb-7 pt-12 sm:px-12 sm:pb-10">
          <div aria-hidden="true" className={styles.trophy}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 40 }} />
          </div>
          <GameScoreReveal
            baseScore={summary.baseScore}
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
              sound="click"
              disabled={isStarting}
              onClick={() => setIsStarting(true)}
              className="flex-1"
            >
              <ReplayRoundedIcon />
              {MESSAGES.replay}
            </Button>
          </div>
        </div>
      </article>
      {isStarting && <Countdown onComplete={enterGame} />}
    </GameLayout>
  );
}
