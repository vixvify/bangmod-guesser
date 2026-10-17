"use client";

import { useMemo, useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
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
    <GameLayout onExit={() => setShowExit(true)}>
      <article
        data-game-id={gameId}
        className={`${styles.roundResult} w-full max-w-3xl`}
      >
        <header className="mb-5 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-primary-light">
            ROUND COMPLETE
          </p>
          <h1 className="mt-2 text-2xl font-bold text-surface-text sm:text-3xl">
            {MESSAGES.roundTitle}
          </h1>
        </header>
        <div className={styles.roundMedal}>
          <svg
            aria-hidden="true"
            viewBox="0 0 200 190"
            className={styles.medalStar}
          >
            <path d="M100 7 128 61 188 70 145 113 155 176 100 147 45 176 55 113 12 70 72 61Z" />
          </svg>
          <div className="relative z-10 text-center text-secondary-dark">
            <p className="text-xs font-semibold">รอบที่ {result.round}</p>
            <p className="font-display text-5xl tabular-nums sm:text-6xl">
              {formatScore(result.score)}
            </p>
            <p className="text-xs font-semibold">{MESSAGES.points}</p>
          </div>
        </div>
        <figure className="overflow-hidden rounded-3xl border border-surface-border bg-secondary-main shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-surface-border px-5 py-3 text-xs text-surface-muted">
            <span className="font-semibold text-primary-light">
              รอบที่ {result.round} / {totalRounds}
            </span>
            <span className="flex items-center gap-1">
              <FlagRoundedIcon fontSize="small" /> สำรวจบางมด
            </span>
          </div>
          <div className="h-64 sm:h-80">
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
        <dl className="my-6 grid gap-3 sm:grid-cols-3">
          <div className={styles.statCard}>
            <dt>{MESSAGES.location}</dt>
            <dd>
              <button
                type="button"
                onClick={() => setShowInfo(true)}
                aria-haspopup="dialog"
                aria-label={`รายละเอียดสถานที่ ${result.location.name}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-1 py-2 text-base font-bold text-surface-text hover:text-primary-light"
              >
                <InfoOutlinedIcon
                  fontSize="small"
                  className="shrink-0 text-primary-light"
                />
                {result.location.name}
              </button>
            </dd>
          </div>
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
        <div className="flex flex-col gap-3 sm:flex-row">
          {!isLastRound && (
            <Button
              href={AppRoutes.gameSummary(gameId)}
              variant="outline"
              sound="click"
            >
              {MESSAGES.summary}
            </Button>
          )}
          <Button
            href={
              isLastRound
                ? AppRoutes.gameSummary(gameId)
                : AppRoutes.game(gameId)
            }
            sound="accept"
            className="flex-1"
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
