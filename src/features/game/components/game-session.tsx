"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GameLayout } from "./game-layout";
import { GameTimer } from "./game-timer";
import { GameRound } from "./game-round";
import { GameImageViewer } from "./game-image-viewer";
import { GameEndedModal } from "./game-ended-modal";
import { SessionExpiredModal } from "./session-expired-modal";
import { ConfirmModal } from "@/shared/components/ui/confirm-modal";
import { Button } from "@/shared/components/ui/button";
import { GAME_DEFAULTS, GAME_ERROR_CODES, GAME_MESSAGES } from "@/features/game/game.constants";
import type { CurrentGameRound, GameGuessResult } from "@/features/game/game";
import type { GuessInput } from "@/features/game/game.schema";
import { GameRoutes } from "@/features/game/game.routes";
import { useNavigationGuard } from "@/shared/hooks/use-navigation-guard";
import { useUnsavedChangesGuard } from "@/shared/hooks/use-unsaved-changes-guard";
import { useGameMusic } from "@/features/game/hooks/use-game-music";
import { getSession } from "@/features/auth/auth-client";
import { httpClient } from "@/shared/lib/http";
import { AppRoutes } from "@/shared/routes/routes";
import {
  getErrorMessage,
  getHttpErrorStatus,
  getHttpErrorCode,
} from "@/shared/lib/error-message";
import { preloadGameImage } from "@/features/game/game-image";

export function GameSession({ gameId }: { gameId: string }) {
  useGameMusic();
  const router = useRouter();
  const navigationGuard = useNavigationGuard();
  const [round, setRound] = useState<CurrentGameRound | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | null
  >(null);
  const submittingRef = useRef(false);
  const exitedRef = useRef(false);
  const gameEndedRef = useRef(false);
  const sessionExpiredRef = useRef(false);
  const isCompletingRoundRef = useRef(false);

  useEffect(() => {
    gameEndedRef.current = gameEnded;
  }, [gameEnded]);

  useEffect(() => {
    sessionExpiredRef.current = sessionExpired;
  }, [sessionExpired]);

  const handleSessionExpired = useCallback(() => {
    if (sessionExpiredRef.current || gameEndedRef.current) return;
    sessionExpiredRef.current = true;
    setSessionExpired(true);
    setExitOpen(false);
    try {
      void httpClient.post(GameRoutes.terminate(gameId));
    } catch {
      // Ignore termination error
    }
  }, [gameId]);

  useEffect(() => {
    if (gameEnded || sessionExpired) return;
    return navigationGuard?.register((continueNavigation) => {
      setPendingNavigation(() => continueNavigation);
      setExitOpen(true);
    });
  }, [gameEnded, sessionExpired, navigationGuard]);

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("auth_channel");
      channel.onmessage = (event) => {
        if (event.data?.type === "LOGOUT") {
          handleSessionExpired();
        }
      };
    } catch {
      // BroadcastChannel might not be supported in some environments
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === "auth:logout") {
        handleSessionExpired();
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      channel?.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [handleSessionExpired]);

  useEffect(() => {
    async function checkSession() {
      if (sessionExpiredRef.current || gameEndedRef.current) return;
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "hidden"
      )
        return;
      try {
        const { data: session } = await getSession();
        if (!session) {
          handleSessionExpired();
        }
      } catch {
        // Ignore passive session check error
      }
    }

    window.addEventListener("focus", () => void checkSession());
    document.addEventListener("visibilitychange", () => void checkSession());
    return () => {
      window.removeEventListener("focus", () => void checkSession());
      document.removeEventListener("visibilitychange", () =>
        void checkSession(),
      );
    };
  }, [handleSessionExpired]);

  const { cancelBrowserBack, confirmBrowserBack, markLeaving } =
    useUnsavedChangesGuard(!gameEnded && !sessionExpired, () => setExitOpen(true), {
      onPageHide: () => {
        if (
          !exitedRef.current &&
          !gameEndedRef.current &&
          !sessionExpiredRef.current &&
          !isCompletingRoundRef.current
        ) {
          try {
            fetch(GameRoutes.exit(gameId), {
              method: "POST",
              keepalive: true,
            });
          } catch {
            // Ignore unload errors
          }
        }
      },
    });

  useEffect(() => {
    let cancelled = false;
    async function loadRound() {
      try {
        const { data } = await httpClient.get<CurrentGameRound>(
          GameRoutes.currentRound(gameId),
        );
        const receivedAt = performance.now();
        await preloadGameImage(data.imageUrl);
        if (cancelled) return;
        const started = data.deadlineAt ? data : (await httpClient.post<CurrentGameRound>(
          GameRoutes.currentRound(gameId),
          { questionNumber: data.questionNumber },
        )).data;
        const startedReceivedAt = data.deadlineAt ? receivedAt : performance.now();
        if (!cancelled && started.deadlineAt) {
          setDeadline(startedReceivedAt + Date.parse(started.deadlineAt) - Date.parse(started.serverTime));
          setRound(started);
        }
      } catch (error) {
        if (!cancelled && getHttpErrorStatus(error) === 401) {
          handleSessionExpired();
        } else if (!cancelled && getHttpErrorCode(error) === GAME_ERROR_CODES.ended) {
          setGameEnded(true);
        } else if (!cancelled)
          setLoadError(
            getErrorMessage(
              error,
              "ไม่สามารถโหลดรอบเกมได้ กรุณากลับหน้าแรกแล้วลองอีกครั้ง",
            ),
          );
      }
    }
    void loadRound();
    return () => {
      cancelled = true;
    };
  }, [gameId, handleSessionExpired, loadAttempt]);

  const submit = useCallback(
    async (input: GuessInput) => {
      if (!round || submittingRef.current || gameEnded || sessionExpired) return;
      submittingRef.current = true;
      setSubmitting(true);
      setSubmitFailed(false);
      try {
        try {
          await httpClient.post<GameGuessResult>(
            GameRoutes.guess(gameId, round.questionNumber),
            input,
          );
        } catch (error) {
          if (getHttpErrorStatus(error) === 401) throw error;
          if (getHttpErrorCode(error) === GAME_ERROR_CODES.ended) throw error;
          const status = getHttpErrorStatus(error);
          if (status !== undefined && status < 500 && status !== 409)
            throw error;
          try {
            await httpClient.get<GameGuessResult>(
              GameRoutes.roundResult(gameId, round.questionNumber),
            );
            if (status === 409) {
              toast.info("รอบนี้ส่งคำตอบไปแล้ว กำลังแสดงผลที่บันทึกไว้");
            }
          } catch (recoveryError) {
            if (getHttpErrorStatus(recoveryError) === 429) throw recoveryError;
            throw error;
          }
        }
        isCompletingRoundRef.current = true;
        markLeaving();
        router.push(AppRoutes.gameRoundScore(gameId, round.questionNumber));
      } catch (error) {
        if (getHttpErrorStatus(error) === 401) {
          handleSessionExpired();
        } else if (getHttpErrorCode(error) === GAME_ERROR_CODES.ended) {
          setGameEnded(true);
        } else {
          setSubmitFailed(true);
          toast.error(getErrorMessage(error, "ส่งคำตอบไม่สำเร็จ กรุณาลองอีกครั้ง"));
        }
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [gameEnded, gameId, handleSessionExpired, markLeaving, round, router, sessionExpired],
  );

  const handleTimeUp = useCallback(() => {
    setTimeUp(true);
    void submit({ guessedLatitude: null, guessedLongitude: null });
  }, [submit]);

  async function confirmExit() {
    setExiting(true);
    try {
      await httpClient.post(GameRoutes.exit(gameId));
      exitedRef.current = true;
      markLeaving();
      setExitOpen(false);
      if (pendingNavigation) {
        pendingNavigation();
        setPendingNavigation(null);
      } else if (!confirmBrowserBack(() => router.push(AppRoutes.home))) {
        router.push(AppRoutes.home);
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error, "ออกจากเกมไม่สำเร็จ กรุณาลองอีกครั้ง"),
      );
    } finally {
      setExiting(false);
    }
  }

  return (
    <>
      <GameLayout
        onExit={() => setExitOpen(true)}
        headerCenter={
          round?.deadlineAt && deadline !== null && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <GameRound round={round.questionNumber} />
              <GameTimer
                initialSeconds={GAME_DEFAULTS.roundDurationSeconds}
                deadline={deadline}
                onTimeUp={handleTimeUp}
              />
            </div>
          )
        }
      >
        <h1 className="sr-only">ทายสถานที่</h1>
        {round?.deadlineAt ? (
          <>
            <GameImageViewer
              imageSrc={round.imageUrl}
              imageAlt="สถานที่ในมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี"
              markerPosition={marker}
              onMapClick={(lat, lng) => setMarker({ lat, lng })}
              onSubmit={() =>
                void submit({
                  guessedLatitude: marker?.lat ?? null,
                  guessedLongitude: marker?.lng ?? null,
                })
              }
              isSubmitDisabled={!marker || submitting || timeUp || gameEnded}
            />
            {submitFailed && (
              <Button
                onClick={() =>
                  void submit(
                    deadline !== null && performance.now() >= deadline
                      ? { guessedLatitude: null, guessedLongitude: null }
                      : {
                          guessedLatitude: marker?.lat ?? null,
                          guessedLongitude: marker?.lng ?? null,
                        },
                  )
                }
              >
                ลองส่งคำตอบอีกครั้ง
              </Button>
            )}
          </>
        ) : loadError ? (
          <div role="alert" className="text-surface-text">
            <p>{loadError}</p>
            <Button
              onClick={() => {
                setLoadError(null);
                setLoadAttempt((value) => value + 1);
              }}
            >
              ลองอีกครั้ง
            </Button>
          </div>
        ) : (
          <p role="status" className="text-surface-text">
            กำลังโหลดรอบเกม…
          </p>
        )}
      </GameLayout>
      <ConfirmModal
        soundEnabled
        open={exitOpen}
        theme="dark"
        title={GAME_MESSAGES.exitGame.title}
        description={GAME_MESSAGES.exitGame.description}
        confirmLabel={GAME_MESSAGES.exitGame.confirm}
        cancelLabel={GAME_MESSAGES.exitGame.cancel}
        onConfirm={() => {
          if (!exiting) void confirmExit();
        }}
        onCancel={() => {
          cancelBrowserBack();
          setPendingNavigation(null);
          setExitOpen(false);
        }}
      />
      <GameEndedModal open={gameEnded} onBack={() => router.push(AppRoutes.home)} />
      <SessionExpiredModal
        open={sessionExpired}
        onBack={() => router.push(AppRoutes.home)}
      />
    </>
  );
}
