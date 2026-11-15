"use client";

import Modal from "@mui/material/Modal";
import { Button } from "@/shared/components/ui/button";
import { GAME_MESSAGES } from "@/features/game/game.constants";

export function GameEndedModal({
  open,
  onBack,
}: {
  open: boolean;
  onBack: () => void;
}) {
  return (
    <Modal
      open={open}
      aria-labelledby="game-ended-title"
      aria-describedby="game-ended-description"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-ended-title"
        aria-describedby="game-ended-description"
        tabIndex={-1}
        className="w-full max-w-md space-y-6 rounded-2xl border border-surface-border bg-secondary-main p-6 text-surface-text shadow-2xl outline-none"
      >
        <div className="space-y-2">
          <h2 id="game-ended-title" className="text-xl font-bold">
            {GAME_MESSAGES.ended.title}
          </h2>
          <p id="game-ended-description" className="text-sm text-surface-muted">
            {GAME_MESSAGES.ended.description}
          </p>
        </div>
        <div className="flex justify-end">
          <Button sound="click" size="small" onClick={onBack}>
            {GAME_MESSAGES.ended.back}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
