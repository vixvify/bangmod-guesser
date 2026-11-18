"use client";

import Modal from "@mui/material/Modal";
import { Button } from "@/shared/components/ui/button";
import { GAME_MESSAGES } from "@/features/game/game.constants";

export function SessionExpiredModal({
  open,
  onBack,
}: {
  open: boolean;
  onBack: () => void;
}) {
  return (
    <Modal
      open={open}
      aria-labelledby="session-expired-title"
      aria-describedby="session-expired-description"
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
        aria-labelledby="session-expired-title"
        aria-describedby="session-expired-description"
        tabIndex={-1}
        className="w-full max-w-md space-y-6 rounded-2xl border border-surface-border bg-secondary-main p-6 text-surface-text shadow-2xl outline-none"
      >
        <div className="space-y-2">
          <h2 id="session-expired-title" className="text-xl font-bold">
            {GAME_MESSAGES.sessionExpired.title}
          </h2>
          <p
            id="session-expired-description"
            className="text-sm text-surface-muted"
          >
            {GAME_MESSAGES.sessionExpired.description}
          </p>
        </div>
        <div className="flex justify-end">
          <Button sound="click" size="small" onClick={onBack}>
            {GAME_MESSAGES.sessionExpired.back}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
