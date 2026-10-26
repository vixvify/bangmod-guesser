"use client";

import { useMemo, useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { GameLayout } from "@/layout/game-layout";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { GameResultMap } from "./game-result-map";
import { LocationInfoModal } from "./location-info-modal";
import type { GameRoundResult } from "@/core/domain/game";
import { GAME_RESULT_MESSAGES as MESSAGES } from "@/core/constants/game-result";
import { AppRoutes } from "@/routes/app/routes";
import { useRouter } from "next/navigation";
import { formatScore } from "@/lib/utils";
import styles from "./game-results.module.css";

type GameRoundScoreProps = {
  gameId: string;
  result: GameRoundResult;
  totalRounds: number;
  accumulatedScore: number;
};

export function GameRoundScore({
  gameId,
  result,
  totalRounds,
  accumulatedScore,
}: GameRoundScoreProps) {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const rounds = useMemo(() => [result], [result]);
  const isLastRound = result.round >= totalRounds;

  return (
    <GameLayout scrollable onExit={() => setShowExit(true)}>
      <article
        data-game-id={gameId}
        className={`${styles.roundResult} w-full max-w-5xl`}
      >
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-primary-light">
              ROUND COMPLETE
            </p>
            <h1 className="mt-2 text-2xl font-bold text-surface-text sm:text-3xl">
              {MESSAGES.roundTitle}
            </h1>
          </div>
          <p className="rounded-full border border-surface-border bg-secondary-main px-4 py-2 text-sm font-semibold text-surface-muted">
            รอบที่ <span className="text-primary-light">{result.round}</span> /{" "}
            {totalRounds}
          </p>
        </header>
        <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <figure className="overflow-hidden rounded-3xl border border-surface-border bg-secondary-main shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-surface-border px-5 py-4">
              <div>
                <p className="text-xs text-surface-muted">
                  {MESSAGES.location}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-surface-text">
                  {result.location.name}
                </h2>
              </div>
              <Button
                variant="outline"
                size="icon"
                sound="click"
                onClick={() => setShowInfo(true)}
                aria-haspopup="dialog"
                aria-label={`รายละเอียดสถานที่ ${result.location.name}`}
              >
                <InfoOutlinedIcon />
              </Button>
            </div>
            <div className="h-64 sm:h-80 lg:h-96">
              <GameResultMap rounds={rounds} />
            </div>
            <figcaption className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-4 py-3 text-xs text-surface-muted">
              <span>
                <span aria-hidden="true" className={styles.actualKey} />
                {MESSAGES.actual}
              </span>
              <span>
                <span aria-hidden="true" className={styles.guessKey} />
                {MESSAGES.guess}
              </span>
            </figcaption>
          </figure>
          <div className="flex flex-col gap-4">
            <section aria-label="คะแนนรอบนี้" className={styles.roundScoreCard}>
              <EmojiEventsRoundedIcon
                aria-hidden="true"
                sx={{ fontSize: 36 }}
              />
              <p className="mt-3 text-sm font-medium text-surface-muted">
                คะแนนรอบนี้
              </p>
              <p className="my-1 font-display text-7xl tabular-nums leading-tight text-rank-gold">
                {formatScore(result.score)}
              </p>
              <p className="text-sm text-surface-muted">{MESSAGES.points}</p>
            </section>
            <dl className="grid flex-1 grid-cols-2 gap-3 lg:grid-cols-1">
              <div className={styles.statCard}>
                <dt>{MESSAGES.distance}</dt>
                <dd className="mt-2 text-2xl font-bold text-primary-light">
                  {formatScore(result.distanceMeters)}{" "}
                  <span className="text-sm font-normal">{MESSAGES.meters}</span>
                </dd>
              </div>
              <div className={styles.statCard}>
                <dt>{MESSAGES.accumulated}</dt>
                <dd className="mt-2 text-2xl font-bold text-rank-gold">
                  {formatScore(accumulatedScore)}{" "}
                  <span className="text-sm font-normal">{MESSAGES.points}</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            href={
              isLastRound
                ? AppRoutes.gameSummary(gameId)
                : AppRoutes.game(gameId)
            }
            sound="accept"
            className="sm:min-w-64"
          >
            {isLastRound ? MESSAGES.summary : MESSAGES.nextRound}
            <ArrowForwardRoundedIcon />
          </Button>
        </div>
      </article>
      <LocationInfoModal
        location={result.location}
        open={showInfo}
        onClose={() => setShowInfo(false)}
      />
      <ConfirmModal
        open={showExit}
        theme="dark"
        soundEnabled
        title="กลับหน้าแรก"
        description="ต้องการกลับหน้าแรกและจบเกมนี้หรือไม่?"
        confirmLabel="กลับหน้าแรก"
        cancelLabel="อยู่ต่อ"
        onConfirm={() => router.push(AppRoutes.home)}
        onCancel={() => setShowExit(false)}
      />
    </GameLayout>
  );
}
