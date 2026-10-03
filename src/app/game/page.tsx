"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { GameLayout } from "@/layout/game-layout";
import { GameTimer } from "@/components/game/game-timer";
import { GameRound } from "@/components/game/game-round";
import { GameImageViewer } from "@/components/game/game-image-viewer";
import { GAME_DEFAULTS } from "@/core/constants/game";
import { AppRoutes } from "@/routes/app/routes";

export default function GamePage() {
  const router = useRouter();
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleTimeUp = useCallback(() => {}, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setMarkerPosition({ lat, lng });
  }, []);

  const handleSubmit = useCallback(() => {
    router.push(AppRoutes.home);
  }, [router]);

  return (
    <GameLayout
      headerCenter={
        <div className="flex flex-wrap items-center justify-center gap-2">
          <GameRound round={GAME_DEFAULTS.currentRound} />
          <GameTimer
            initialSeconds={GAME_DEFAULTS.roundDurationSeconds}
            onTimeUp={handleTimeUp}
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
  );
}
