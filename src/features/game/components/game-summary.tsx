"use client";

import { useRouter } from "next/navigation";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { GameLayout } from "@/features/game/components/game-layout";
import { GameScoreReveal } from "./game-score-reveal";
import { Button } from "@/shared/components/ui/button";
import { Countdown } from "@/shared/components/ui/countdown";
import { useStartGame } from "@/features/game/hooks/use-start-game";
import { GameLoadingOverlay } from "@/features/game/components/game-loading-overlay";
import { AppRoutes } from "@/shared/routes/routes";
import { GAME_RESULT_MESSAGES as MESSAGES } from "@/features/game/game-result.constants";
import type { GameSummaryResult } from "@/features/game/game";
import { GAME_MAX_SCORE } from "@/features/game/game.constants";
import { formatScore, formatTime, formatTimeForSpeech } from "@/shared/lib/utils";
import styles from "./game-results.module.css";

export function GameSummary({
  gameId,
  summary,
}: {
  gameId: string;
  summary: GameSummaryResult;
}) {
  const router = useRouter();
  const { loading, countingDown, error, prepare, start } = useStartGame();
  const totalSeconds = summary.totalTimeSeconds;

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
            maxScore={GAME_MAX_SCORE}
            totalScore={summary.totalScore}
          />
          <dl className="mx-auto mb-7 mt-3 grid max-w-lg grid-cols-2 gap-3">
            <div className={styles.statCard}>
              <dt>
                <AccessTimeRoundedIcon fontSize="small" /> {MESSAGES.time}
              </dt>
              <dd
                aria-label={formatTimeForSpeech(totalSeconds)}
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
              disabled={loading || countingDown}
              onClick={() => void prepare()}
              className="flex-1"
            >
              <ReplayRoundedIcon />
              {MESSAGES.replay}
            </Button>
          </div>
          {error && <div role="alert" className="mt-3 text-center text-surface-text"><p>{error}</p><Button onClick={() => void prepare()}>ลองอีกครั้ง</Button></div>}
        </div>
      </article>
      {loading && <GameLoadingOverlay />}
      {countingDown && <Countdown onComplete={start} />}
    </GameLayout>
  );
}
