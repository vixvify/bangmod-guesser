import { useEffect, useRef, useState } from "react";

type UseCountdownOptions = {
  initialSeconds: number;
  deadline?: number;
  onTimeUp?: () => void;
};

type UseCountdownReturn = {
  secondsLeft: number;
  isUrgent: boolean;
};

const URGENT_THRESHOLD = 10;

export function useCountdown({
  initialSeconds,
  deadline,
  onTimeUp,
}: UseCountdownOptions): UseCountdownReturn {
  const [secondsLeft, setSecondsLeft] = useState(() => deadline === undefined ? initialSeconds : Math.max(0, Math.min(initialSeconds, Math.ceil((deadline - performance.now()) / 1000))));
  const hasNotifiedTimeUp = useRef(deadline === undefined && initialSeconds <= 0);

  useEffect(() => {
    if (secondsLeft !== 0 || hasNotifiedTimeUp.current) return;

    hasNotifiedTimeUp.current = true;
    onTimeUp?.();
  }, [secondsLeft, onTimeUp]);

  useEffect(() => {
    if (deadline !== undefined) {
      const update = () => setSecondsLeft(Math.max(0, Math.min(initialSeconds, Math.ceil((deadline - performance.now()) / 1000))));
      update();
      const id = window.setInterval(update, 250);
      return () => window.clearInterval(id);
    }
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((previous) => Math.max(0, previous - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft, deadline, initialSeconds]);

  return {
    secondsLeft,
    isUrgent: secondsLeft <= URGENT_THRESHOLD,
  };
}
