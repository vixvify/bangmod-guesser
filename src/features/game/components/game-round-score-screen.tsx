"use client";

import { useEffect, useState } from "react";
import { GameRoundScore } from "./game-round-score";
import { GameLayout } from "./game-layout";
import { GAME_ROUND_COUNT } from "@/features/game/game.constants";
import { GameRoutes } from "@/features/game/game.routes";
import { GAME_RESULT_MESSAGES } from "@/features/game/game-result.constants";
import type { CurrentGameRound, GameGuessResult } from "@/features/game/game";
import { preloadGameImage } from "@/features/game/game-image";
import { httpClient } from "@/shared/lib/http";
import { AppRoutes } from "@/shared/routes/routes";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/shared/lib/error-message";

export function GameRoundScoreScreen({
  gameId,
  questionNumber,
}: {
  gameId: string;
  questionNumber: number;
}) {
  const [result, setResult] = useState<GameGuessResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nextReady, setNextReady] = useState(false);
  const [nextError, setNextError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await httpClient.get<GameGuessResult>(
          GameRoutes.roundResult(gameId, questionNumber),
        );
        if (!cancelled) setResult(data);
      } catch (error) {
        if (!cancelled)
          setErrorMessage(
            getErrorMessage(error, "ไม่สามารถโหลดผลรอบนี้ได้ กรุณาลองอีกครั้ง"),
          );
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [gameId, questionNumber]);

  useEffect(() => {
    if (questionNumber >= GAME_ROUND_COUNT) return;
    let cancelled = false;
    async function prepareNextRound() {
      try {
        const { data } = await httpClient.get<CurrentGameRound>(
          GameRoutes.currentRound(gameId),
        );
        if (data.questionNumber !== questionNumber + 1)
          throw new Error("Unexpected round");
        await preloadGameImage(data.imageUrl);
        if (!cancelled) setNextReady(true);
      } catch (error) {
        if (!cancelled)
          setNextError(
            getErrorMessage(
              error,
              "ไม่สามารถโหลดรูปของรอบถัดไปได้ กรุณาลองอีกครั้ง",
            ),
          );
      }
    }
    void prepareNextRound();
    return () => {
      cancelled = true;
    };
  }, [gameId, questionNumber, attempt]);

  if (!result)
    return (
      <GameLayout onExit={() => router.push(AppRoutes.home)}>
        <h1 className="sr-only">{GAME_RESULT_MESSAGES.roundTitle}</h1>
        <p
          role={errorMessage ? "alert" : "status"}
          className="text-surface-text"
        >
          {errorMessage ?? "กำลังโหลดผลรอบ…"}
        </p>
      </GameLayout>
    );
  return (
    <GameRoundScore
      gameId={gameId}
      totalRounds={GAME_ROUND_COUNT}
      nextReady={nextReady}
      nextError={nextError}
      onRetryNext={() => {
        setNextError(null);
        setAttempt((value) => value + 1);
      }}
      accumulatedScore={result.accumulatedScore}
      imageUrl={result.imageUrl}
      result={{
        round: questionNumber,
        location: result.location,
        guess:
          result.guessedLatitude === null || result.guessedLongitude === null
            ? null
            : {
                latitude: result.guessedLatitude,
                longitude: result.guessedLongitude,
              },
        distanceMeters: result.distanceMeters,
        score: result.score,
      }}
    />
  );
}
