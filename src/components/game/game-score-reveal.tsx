"use client";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { Button } from "@/components/ui/button";
import { GAME_RESULT_MESSAGES as MESSAGES } from "@/core/constants/game-result";
import { useScoreReveal } from "@/hooks/use-score-reveal";
import { formatScore } from "@/lib/utils";
import styles from "./game-results.module.css";

type GameScoreRevealProps = { baseScore: number; bonusScore: number; maxScore: number };

export function GameScoreReveal({ baseScore, bonusScore, maxScore }: GameScoreRevealProps) {
  const { score, phase, skip } = useScoreReveal(baseScore, bonusScore);
  const total = baseScore + bonusScore;
  const percentage = Math.min(100, Math.max(0, score / maxScore * 100));

  return (
    <section aria-labelledby="summary-score-title" className="relative text-center">
      <p className="text-xs font-semibold tracking-[0.3em] text-primary-light">MISSION COMPLETE</p>
      <h1 id="summary-score-title" className="mt-3 text-xl font-bold text-surface-text sm:text-2xl">{MESSAGES.summaryTitle}</h1>
      <div aria-hidden="true" className={`${styles.scoreNumber} ${phase === "complete" ? styles.scoreComplete : ""}`}>
        {formatScore(score)}
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {phase === "complete" ? `คะแนนจากการทาย ${formatScore(baseScore)} คะแนน โบนัส ${formatScore(bonusScore)} คะแนน รวม ${formatScore(total)} จาก ${formatScore(maxScore)} คะแนน` : "กำลังแสดงผลคะแนน"}
      </p>
      <p className="text-sm text-surface-muted sm:text-base">จากคะแนนเต็ม <strong className="text-surface-text">{formatScore(maxScore)}</strong> คะแนน</p>
      <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-primary-main/40 bg-secondary-main px-4 py-2 text-sm font-semibold text-primary-light">
        <AutoAwesomeRoundedIcon fontSize="small" />
        <span aria-hidden="true">{phase === "base" ? MESSAGES.baseScore : `${MESSAGES.bonus} +${formatScore(bonusScore)}`}</span>
        <span className="sr-only">{MESSAGES.bonus} {formatScore(bonusScore)} คะแนน</span>
      </div>
      <div className="mx-auto mt-7 max-w-xl">
        <div role="meter" aria-label="คะแนนรวมโบนัส" aria-valuemin={0} aria-valuemax={maxScore} aria-valuenow={Math.min(total, maxScore)} aria-valuetext={`${formatScore(total)} จาก ${formatScore(maxScore)} คะแนน`} className={styles.scoreTrack}>
          <div aria-hidden="true" className={styles.scoreFill} style={{ width: `${percentage}%` }} />
          <div aria-hidden="true" className={styles.scoreDivisions} />
        </div>
        <div aria-hidden="true" className="mt-2 flex justify-between text-xs tabular-nums text-surface-muted"><span>0 คะแนน</span><span>{formatScore(maxScore)} คะแนน</span></div>
      </div>
      <div className="mt-4 min-h-10">
        <Button variant="ghost" size="small" onClick={skip} disabled={phase === "complete"}>
          {phase === "complete" ? "แสดงคะแนนครบแล้ว" : MESSAGES.skipAnimation}
        </Button>
      </div>
    </section>
  );
}
