"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GameLayout } from "./game-layout";
import { GameTimer } from "./game-timer";
import { GameRound } from "./game-round";
import { GameImageViewer } from "./game-image-viewer";
import { ConfirmModal } from "@/shared/components/ui/confirm-modal";
import { Button } from "@/shared/components/ui/button";
import { GAME_DEFAULTS, GAME_MESSAGES } from "@/features/game/game.constants";
import type { CurrentGameRound, GameGuessResult } from "@/features/game/game";
import type { GuessInput } from "@/features/game/game.schema";
import { GameRoutes } from "@/features/game/game.routes";
import { useUnsavedChangesGuard } from "@/shared/hooks/use-unsaved-changes-guard";
import { useGameMusic } from "@/features/game/hooks/use-game-music";
import { httpClient } from "@/shared/lib/http";
import { AppRoutes } from "@/shared/routes/routes";

export function GameSession({ gameId }: { gameId: string }) {
  useGameMusic();
  const router = useRouter();
  const [round, setRound] = useState<CurrentGameRound | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const submittingRef = useRef(false);
  const { cancelBrowserBack, confirmBrowserBack } = useUnsavedChangesGuard(true, () => setExitOpen(true));

  useEffect(() => {
    let cancelled = false;
    async function loadRound() {
      try {
        const { data } = await httpClient.get<CurrentGameRound>(GameRoutes.currentRound(gameId));
        if (!cancelled) setRound(data);
      } catch {
        if (!cancelled) setLoadError(true);
      }
    }
    void loadRound();
    return () => { cancelled = true; };
  }, [gameId]);

  const submit = useCallback(async (input: GuessInput) => {
    if (!round || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitFailed(false);
    try {
      try {
        await httpClient.post<GameGuessResult>(GameRoutes.guess(gameId, round.questionNumber), input);
      } catch {
        await httpClient.get<GameGuessResult>(GameRoutes.roundResult(gameId, round.questionNumber));
      }
      router.push(AppRoutes.gameRoundScore(gameId, round.questionNumber));
    } catch {
      setSubmitFailed(true);
      toast.error("ส่งคำตอบไม่สำเร็จ กรุณาลองอีกครั้ง");
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [gameId, round, router]);

  const handleTimeUp = useCallback(() => {
    setTimeUp(true);
    void submit({ guessedLatitude: null, guessedLongitude: null });
  }, [submit]);

  async function confirmExit() {
    setExiting(true);
    try {
      await httpClient.post(GameRoutes.exit(gameId));
      setExitOpen(false);
      if (!confirmBrowserBack(() => router.push(AppRoutes.home))) router.push(AppRoutes.home);
    } catch {
      toast.error("ออกจากเกมไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setExiting(false);
    }
  }

  return (
    <>
      <GameLayout
        onExit={() => setExitOpen(true)}
        headerCenter={round && <div className="flex flex-wrap items-center justify-center gap-2">
          <GameRound round={round.questionNumber} />
          <GameTimer initialSeconds={GAME_DEFAULTS.roundDurationSeconds} deadlineAt={round.deadlineAt} onTimeUp={handleTimeUp} />
        </div>}
      >
        <h1 className="sr-only">ทายสถานที่</h1>
        {round ? <>
          <GameImageViewer imageSrc={round.imageUrl} imageAlt="สถานที่ในมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี"
            markerPosition={marker} onMapClick={(lat, lng) => setMarker({ lat, lng })}
            onSubmit={() => void submit({ guessedLatitude: marker?.lat ?? null, guessedLongitude: marker?.lng ?? null })}
            isSubmitDisabled={!marker || submitting || timeUp} />
          {submitFailed && <Button onClick={() => void submit(Date.now() >= Date.parse(round.deadlineAt)
            ? { guessedLatitude: null, guessedLongitude: null }
            : { guessedLatitude: marker?.lat ?? null, guessedLongitude: marker?.lng ?? null })}>
            ลองส่งคำตอบอีกครั้ง
          </Button>}
        </> : loadError ? <p role="alert" className="text-surface-text">ไม่สามารถโหลดรอบเกมได้ กรุณากลับหน้าแรกแล้วลองอีกครั้ง</p>
          : <p role="status" className="text-surface-text">กำลังโหลดรอบเกม…</p>}
      </GameLayout>
      <ConfirmModal soundEnabled open={exitOpen} theme="dark" title={GAME_MESSAGES.exitGame.title}
        description={GAME_MESSAGES.exitGame.description} confirmLabel={GAME_MESSAGES.exitGame.confirm}
        cancelLabel={GAME_MESSAGES.exitGame.cancel} onConfirm={() => { if (!exiting) void confirmExit(); }}
        onCancel={() => { cancelBrowserBack(); setExitOpen(false); }} />
    </>
  );
}
