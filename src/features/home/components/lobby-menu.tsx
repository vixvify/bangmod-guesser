"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Button } from "@/shared/components/ui/button";
import { Countdown } from "@/shared/components/ui/countdown";
import { getSession } from "@/features/auth/auth-client";
import { AppRoutes } from "@/shared/routes/routes";
import { GameRoutes } from "@/features/game/game.routes";
import { httpClient, HttpError } from "@/shared/lib/http";
import { toast } from "sonner";
import { getErrorMessage } from "@/shared/lib/error-message";

export function LobbyMenu() {
  const [isStarting, setIsStarting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  const enterGame = useCallback(async () => {
    try {
      const { data } = await httpClient.post<{ gameId: string }>(GameRoutes.create);
      router.push(AppRoutes.game(data.gameId));
    } catch (error) {
      setIsStarting(false);
      toast.error(getErrorMessage(error, "ไม่สามารถเริ่มเกมได้ กรุณาลองอีกครั้ง"));
    }
  }, [router]);

  const handlePlay = useCallback(async () => {
    setIsChecking(true);
    try {
      const { data: session, error } = await getSession();
      if (error) throw new HttpError("Session request failed", error.status);
      if (!session) {
        router.push(AppRoutes.login);
        return;
      }
      setIsStarting(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "ไม่สามารถตรวจสอบบัญชีได้ กรุณาลองอีกครั้ง"));
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

