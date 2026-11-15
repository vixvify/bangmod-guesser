"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { httpClient } from "@/shared/lib/http";
import { getErrorMessage } from "@/shared/lib/error-message";
import { AppRoutes } from "@/shared/routes/routes";
import { GameRoutes } from "@/features/game/game.routes";
import type { CurrentGameRound } from "@/features/game/game";
import { preloadGameImage } from "@/features/game/game-image";

export function useStartGame() {
  const router = useRouter();
  const gameId = useRef<string | null>(null);
  const busy = useRef(false);
  const [loading, setLoading] = useState(false);
  const [countingDown, setCountingDown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prepare = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError(null);
    try {
      if (!gameId.current) {
        const { data } = await httpClient.post<{ gameId: string }>(GameRoutes.create);
        gameId.current = data.gameId;
      }
      const { data } = await httpClient.get<CurrentGameRound>(GameRoutes.currentRound(gameId.current));
      await preloadGameImage(data.imageUrl);
      if (data.deadlineAt) {
        router.push(AppRoutes.game(gameId.current));
        return;
      }
      setCountingDown(true);
    } catch (error) {
      setError(getErrorMessage(error, "ไม่สามารถเตรียมเกมหรือโหลดรูปได้ กรุณาลองอีกครั้ง"));
    } finally {
      setLoading(false);
      busy.current = false;
    }
  }, [router]);

  const start = useCallback(() => {
    if (!gameId.current || busy.current) return;
    busy.current = true;
    setCountingDown(false);
    setLoading(true);
    router.push(AppRoutes.game(gameId.current));
  }, [router]);

  return { loading, countingDown, error, prepare, start };
}
