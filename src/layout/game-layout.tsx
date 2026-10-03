"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Button } from "@/components/ui/button";
import { GameBackdrop } from "@/components/game/game-backdrop";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { SettingsModal } from "@/components/ui/settings-modal";
import { GAME_MESSAGES } from "@/core/constants/game";
import { AppRoutes } from "@/routes/app/routes";

type GameLayoutProps = {
  children: ReactNode;
  headerCenter?: ReactNode;
};

export function GameLayout({ children, headerCenter }: GameLayoutProps) {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  function handleExitConfirm() {
    setIsExitModalOpen(false);
    router.push(AppRoutes.home);
  }

  return (
    <div className="relative flex min-h-svh flex-col overflow-x-hidden bg-secondary-main lg:h-svh lg:overflow-hidden">
      <GameBackdrop />
      <header className="relative z-30 flex shrink-0 items-center justify-end px-3 pb-1 pt-3 sm:px-5 sm:pt-5 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-0 lg:px-6">
        <nav
          aria-label="เมนูเกม"
          className="flex items-center gap-2 lg:pointer-events-auto"
        >
          <Button
            variant="surface"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="ตั้งค่าเกม"
            title="ตั้งค่าเกม"
          >
            <SettingsOutlinedIcon />
          </Button>

          <Button
            variant="surface"
            size="small"
            onClick={() => setIsExitModalOpen(true)}
          >
            <LogoutRoundedIcon fontSize="small" />
            {GAME_MESSAGES.exitGame.button}
          </Button>
        </nav>
      </header>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col items-center justify-start px-3 pb-6 pt-7 sm:p-5 lg:min-h-0 lg:justify-center">
        <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-3 sm:gap-4">
          {headerCenter && <div className="shrink-0">{headerCenter}</div>}
          {children}
        </div>
      </div>

      <SettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <ConfirmModal
        open={isExitModalOpen}
        title={GAME_MESSAGES.exitGame.title}
        description={GAME_MESSAGES.exitGame.description}
        confirmLabel={GAME_MESSAGES.exitGame.confirm}
        cancelLabel={GAME_MESSAGES.exitGame.cancel}
        onConfirm={handleExitConfirm}
        onCancel={() => setIsExitModalOpen(false)}
      />
    </div>
  );
}
