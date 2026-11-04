"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { GameLayout } from "@/features/game/components/game-layout";
import { GameTimer } from "@/features/game/components/game-timer";
import { GameRound } from "@/features/game/components/game-round";
import { GameImageViewer } from "@/features/game/components/game-image-viewer";
import { ConfirmModal } from "@/shared/components/ui/confirm-modal";
import { GAME_DEFAULTS, GAME_MESSAGES } from "@/features/game/game.constants";
import { useUnsavedChangesGuard } from "@/shared/hooks/use-unsaved-changes-guard";
import { useGameMusic } from "@/features/game/hooks/use-game-music";
import { AppRoutes } from "@/shared/routes/routes";

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
        <h1 className="sr-only">ทายสถานที่</h1>
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
