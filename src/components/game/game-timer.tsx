"use client";

import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { formatTime } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";

type GameTimerProps = {
  initialSeconds: number;
  onTimeUp?: () => void;
};

export function GameTimer({ initialSeconds, onTimeUp }: GameTimerProps) {
  const { secondsLeft, isUrgent } = useCountdown({ initialSeconds, onTimeUp });

  return (
    <div
      role="timer"
      aria-label="เวลาที่เหลือ"
      aria-live="polite"
      className={`inline-flex items-center gap-2.5 rounded-xl border px-4 py-2 font-semibold tabular-nums transition-colors duration-300 ${
        isUrgent
          ? "border-red-400/60 bg-red-500/15 text-red-400"
          : "border-white/15 bg-white/8 text-secondary-light"
      }`}
    >
      <AccessTimeRoundedIcon
        fontSize="small"
        className={isUrgent ? "animate-pulse" : ""}
      />
      <span className="hidden text-xs tracking-wide opacity-75 sm:inline">เวลาที่เหลือ</span>
      <span className="text-2xl font-bold tracking-wider">
        {formatTime(secondsLeft)}
      </span>
    </div>
  );
}
