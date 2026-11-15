"use client";

import Modal from "@mui/material/Modal";
import { Button } from "@/shared/components/ui/button";

export function ActiveGameModal({
  open,
  onResume,
  onRestart,
  onClose,
}: {
  open: boolean;
  onResume: () => void;
  onRestart: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="active-game-title"
      aria-describedby="active-game-description"
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
        aria-labelledby="active-game-title"
        aria-describedby="active-game-description"
        tabIndex={-1}
        className="w-full max-w-md space-y-6 rounded-2xl border border-surface-border bg-secondary-main p-6 text-surface-text shadow-2xl outline-none"
      >
        <div className="space-y-2">
          <h2 id="active-game-title" className="text-xl font-bold">
            มีเกมที่กำลังเล่นอยู่
          </h2>
          <p
            id="active-game-description"
            className="text-sm text-surface-muted"
          >
            ต้องการเล่นเกมเดิมต่อหรือเริ่มเกมใหม่? หากเริ่มใหม่ เกมเดิมจะจบลง
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" size="small" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="outline" size="small" onClick={onRestart}>
            เริ่มเกมใหม่
          </Button>
          <Button size="small" sound="accept" onClick={onResume}>
            เล่นต่อ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
