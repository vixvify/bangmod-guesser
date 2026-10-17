"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { GameLayout } from "@/layout/game-layout";
import { GameTimer } from "@/components/game/game-timer";
import { GameRound } from "@/components/game/game-round";
import { GameImageViewer } from "@/components/game/game-image-viewer";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { GAME_DEFAULTS, GAME_MESSAGES } from "@/core/constants/game";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { useGameMusic } from "@/hooks/use-game-music";
import { AppRoutes } from "@/routes/app/routes";

export function GameSession({
  gameId = GAME_DEFAULTS.demoGameId,
}: {
  gameId?: string;
}) {
  useGameMusic();
  const router = useRouter();
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const { cancelBrowserBack, confirmBrowserBack } = useUnsavedChangesGuard(
    true,
    () => setIsExitModalOpen(true),
  );

  const handleSubmit = useCallback(
    () => router.push(AppRoutes.gameRoundScore(gameId)),
    [gameId, router],
  );

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setMarkerPosition({ lat, lng });
  }, []);

  const requestExit = useCallback(() => setIsExitModalOpen(true), []);

  function confirmExit() {
    setIsExitModalOpen(false);
    if (!confirmBrowserBack(() => router.push(AppRoutes.home))) {
      router.push(AppRoutes.home);
    }
  }

  function cancelExit() {
    cancelBrowserBack();
    setIsExitModalOpen(false);
  }

  return (
    <>
      <GameLayout
        onExit={requestExit}
        headerCenter={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <GameRound round={GAME_DEFAULTS.currentRound} />
            <GameTimer
              initialSeconds={GAME_DEFAULTS.roundDurationSeconds}
              onTimeUp={handleSubmit}
            />
          </div>
        }
      >
        <GameImageViewer
          imageSrc="/images/kmutt-bangmod-1.jpg"
          imageAlt="สถานที่ในมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี"
          markerPosition={markerPosition}
          onMapClick={handleMapClick}
          onSubmit={handleSubmit}
          isSubmitDisabled={!markerPosition}
        />
      </GameLayout>
      <ConfirmModal
        soundEnabled
        open={isExitModalOpen}
        theme="dark"
        title={GAME_MESSAGES.exitGame.title}
        description={GAME_MESSAGES.exitGame.description}
        confirmLabel={GAME_MESSAGES.exitGame.confirm}
        cancelLabel={GAME_MESSAGES.exitGame.cancel}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </>
  );
}
