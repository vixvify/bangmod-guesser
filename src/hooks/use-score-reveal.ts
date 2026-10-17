"use client";

import { useEffect, useState } from "react";
import { SCORE_REVEAL_TIMING } from "@/core/constants/game-result";

export function useScoreReveal(baseScore: number, bonusScore: number) {
  const [skipped, setSkipped] = useState(false);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"base" | "bonus" | "complete">("base");
  const total = baseScore + bonusScore;

  useEffect(() => {
    if (skipped) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const bonusStart = SCORE_REVEAL_TIMING.base + SCORE_REVEAL_TIMING.pause;
    let frame: number;
    let startedAt: number | undefined;

    function tick(now: number) {
      startedAt ??= now;
      const elapsed = now - startedAt;
      if (media.matches || elapsed >= bonusStart + SCORE_REVEAL_TIMING.bonus) {
        setScore(total);
        setPhase("complete");
        return;
      }
      const addingBonus = elapsed >= bonusStart;
      const progress = Math.min(1, addingBonus
        ? (elapsed - bonusStart) / SCORE_REVEAL_TIMING.bonus
        : elapsed / SCORE_REVEAL_TIMING.base);
      const eased = 1 - Math.pow(1 - progress, 3);
      setPhase(addingBonus ? "bonus" : "base");
      setScore(Math.round(addingBonus ? baseScore + bonusScore * eased : baseScore * eased));
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [baseScore, bonusScore, skipped, total]);

  return {
    score: skipped ? total : score,
    phase: skipped ? "complete" as const : phase,
    skip: () => setSkipped(true),
  };
}
