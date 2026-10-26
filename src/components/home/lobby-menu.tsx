"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { getSession } from "@/lib/auth-client";
import { AppRoutes } from "@/routes/app/routes";
import { GAME_DEFAULTS } from "@/core/constants/game";

export function LobbyMenu() {
  const [isStarting, setIsStarting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  const enterGame = useCallback(
    () => router.push(AppRoutes.game(GAME_DEFAULTS.demoGameId)),
    [router],
  );

  const handlePlay = useCallback(async () => {
    setIsChecking(true);
    try {
      const { data: session } = await getSession();
      if (!session) {
        router.push(AppRoutes.login);
        return;
      }
      setIsStarting(true);
    } finally {
      setIsChecking(false);
    }
  }, [router]);

  return (
    <div className="mx-auto mt-8 w-full max-w-80 motion-safe:animate-home-enter motion-safe:[animation-delay:240ms]">
      <div className="relative -rotate-2 rounded-2xl border border-primary-soft/35 p-1.5">
        <Button
          sound="click"
          variant="play"
          disabled={isStarting || isChecking}
          onClick={handlePlay}
          aria-label="Play Bangmod Guesser"
          className="min-h-16 w-full"
        >
          <PlayArrowRoundedIcon />
          <span className="font-display text-3xl tracking-widest">PLAY</span>
        </Button>
      </div>
      {isStarting && <Countdown onComplete={enterGame} />}
    </div>
  );
}

