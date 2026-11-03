import { useEffect, useRef, useState } from "react";

type UseCountdownOptions = {
  initialSeconds: number;
  onTimeUp?: () => void;
};

type UseCountdownReturn = {
  secondsLeft: number;
  isUrgent: boolean;
};

const URGENT_THRESHOLD = 10;

export function useCountdown({
  initialSeconds,
  onTimeUp,
}: UseCountdownOptions): UseCountdownReturn {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const hasNotifiedTimeUp = useRef(initialSeconds <= 0);

  useEffect(() => {
    if (secondsLeft !== 0 || hasNotifiedTimeUp.current) return;

    hasNotifiedTimeUp.current = true;
    onTimeUp?.();
  }, [secondsLeft, onTimeUp]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((previous) => Math.max(0, previous - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  return {
    secondsLeft,
    isUrgent: secondsLeft <= URGENT_THRESHOLD,
  };
}
