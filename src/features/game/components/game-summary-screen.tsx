"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameSummary } from "./game-summary";
import { GameLayout } from "./game-layout";
import { GameRoutes } from "@/features/game/game.routes";
import { GAME_RESULT_MESSAGES } from "@/features/game/game-result.constants";
import type { GameSummaryResult } from "@/features/game/game";
import { httpClient } from "@/shared/lib/http";
import { AppRoutes } from "@/shared/routes/routes";
import { getErrorMessage } from "@/shared/lib/error-message";

export function GameSummaryScreen({ gameId }: { gameId: string }) {
  const [summary, setSummary] = useState<GameSummaryResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await httpClient.get<GameSummaryResult>(GameRoutes.summary(gameId));
        if (!cancelled) setSummary(data);
      } catch (error) {
        if (!cancelled) setErrorMessage(getErrorMessage(error, "ไม่สามารถโหลดคะแนนรวมได้ กรุณาลองอีกครั้ง"));
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [gameId]);
  if (summary) return <GameSummary gameId={gameId} summary={summary} />;
  return <GameLayout onExit={() => router.push(AppRoutes.home)}>
    <h1 className="sr-only">{GAME_RESULT_MESSAGES.summaryTitle}</h1>
    <p role={errorMessage ? "alert" : "status"} className="text-surface-text">
      {errorMessage ?? "กำลังโหลดคะแนนรวม…"}
    </p>
  </GameLayout>;
}
