"use client";

import CircularProgress from "@mui/material/CircularProgress";
import Modal from "@mui/material/Modal";

export function GameLoadingOverlay() {
  return (
    <Modal
      open
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        role="status"
        aria-live="polite"
        tabIndex={-1}
        className="flex h-dvh w-full flex-col items-center justify-center gap-6 bg-secondary-main/95 p-6 text-center text-secondary-light outline-none"
      >
        <CircularProgress color="primary" aria-hidden="true" />
        <p className="text-lg font-semibold">กำลังเตรียมเกมและโหลดรูป…</p>
      </div>
    </Modal>
  );
}
