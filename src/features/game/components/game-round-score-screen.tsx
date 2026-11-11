"use client";

import { useEffect, useState } from "react";
import { GameRoundScore } from "./game-round-score";
import { GameLayout } from "./game-layout";
import { GAME_ROUND_COUNT } from "@/features/game/game.constants";
import { GameRoutes } from "@/features/game/game.routes";
import type { GameGuessResult } from "@/features/game/game";
import { httpClient } from "@/shared/lib/http";
import { AppRoutes } from "@/shared/routes/routes";
import { useRouter } from "next/navigation";

export function GameRoundScoreScreen({ gameId, questionNumber }: { gameId: string; questionNumber: number }) {
  const [result, setResult] = useState<GameGuessResult | null>(null);
  const [failed, setFailed] = useState(false);
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await httpClient.get<GameGuessResult>(GameRoutes.roundResult(gameId, questionNumber));
        if (!cancelled) setResult(data);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [gameId, questionNumber]);

  if (!result) return <GameLayout onExit={() => router.push(AppRoutes.home)}>
    <p role={failed ? "alert" : "status"} className="text-surface-text">
      {failed ? "ไม่สามารถโหลดผลรอบนี้ได้ กรุณาลองอีกครั้ง" : "กำลังโหลดผลรอบ…"}
    </p>
  </GameLayout>;
  return <GameRoundScore gameId={gameId} totalRounds={GAME_ROUND_COUNT}
    accumulatedScore={result.accumulatedScore} imageUrl={result.imageUrl}
    result={{
      round: questionNumber,
      location: result.location,
      guess: result.guessedLatitude === null || result.guessedLongitude === null
        ? null : { latitude: result.guessedLatitude, longitude: result.guessedLongitude },
      distanceMeters: result.distanceMeters,
      score: result.score,
    }} />;
}
