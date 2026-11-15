"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Button } from "@/shared/components/ui/button";
import { Countdown } from "@/shared/components/ui/countdown";
import { getSession } from "@/features/auth/auth-client";
import { AppRoutes } from "@/shared/routes/routes";
import { HttpError } from "@/shared/lib/http";
import { toast } from "sonner";
import { getErrorMessage } from "@/shared/lib/error-message";
import { useStartGame } from "@/features/game/hooks/use-start-game";
import { GameLoadingOverlay } from "@/features/game/components/game-loading-overlay";
import { ActiveGameModal } from "@/features/game/components/active-game-modal";

export function LobbyMenu() {
  const { loading, countingDown, error: startError, prepare, start, activeGameId, resume, restart, closeActiveGame } = useStartGame();
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  const handlePlay = useCallback(async () => {
    setIsChecking(true);
    try {
      const { data: session, error } = await getSession();
      if (error) throw new HttpError("Session request failed", error.status);
      if (!session) {
        router.push(AppRoutes.login);
        return;
      }
      await prepare();
      setIsChecking(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "ไม่สามารถตรวจสอบบัญชีได้ กรุณาลองอีกครั้ง"));
      setIsChecking(false);
    }
  }, [router, prepare]);

  return (
    <div className="mx-auto mt-8 w-full max-w-64 sm:max-w-80 motion-safe:animate-home-enter motion-safe:[animation-delay:240ms]">
      <div className="relative -rotate-2 rounded-2xl border border-primary-soft/35 p-1.5">
        <Button
          sound="click"
          variant="play"
          disabled={loading || countingDown || isChecking}
          onClick={handlePlay}
          aria-label="Play Bangmod Guesser"
          className="min-h-14 w-full sm:min-h-16"
        >
          <PlayArrowRoundedIcon />
          <span className="font-display text-2xl tracking-widest sm:text-3xl">PLAY</span>
        </Button>
      </div>
      {(isChecking || loading) && !countingDown && <GameLoadingOverlay />}
      {startError && <div role="alert" className="mt-3 text-center text-surface-text"><p>{startError}</p><Button onClick={() => void prepare()}>ลองอีกครั้ง</Button></div>}
      {countingDown && <Countdown onComplete={start} />}
      <ActiveGameModal open={!!activeGameId} onResume={resume} onRestart={restart} onClose={closeActiveGame} />
    </div>
  );
}

