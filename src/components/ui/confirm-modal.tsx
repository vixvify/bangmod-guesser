"use client";

import Modal from "@mui/material/Modal";
import { useId } from "react";
import { Button } from "@/components/ui/button";

type ConfirmModalProps = {
  open: boolean;
  busy?: boolean;
  theme?: "light" | "dark";
  soundEnabled?: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  busy = false,
  theme = "light",
  soundEnabled = false,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const isDark = theme === "dark";

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onCancel}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} tabIndex={-1} style={isDark ? undefined : { backgroundColor: "#fff" }} className={`w-full max-w-md space-y-6 rounded-2xl border p-6 shadow-2xl outline-none ${isDark ? "border-surface-border bg-secondary-main text-surface-text" : "border-black/10 text-secondary-dark"}`}>
        <div className="space-y-2">
          <h2 id={titleId} className="text-xl font-bold">
            {title}
          </h2>
          <p id={descriptionId} className={`text-sm ${isDark ? "text-surface-muted" : "text-neutral-500"}`}>
            {description}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <Button sound={soundEnabled ? "click" : undefined} variant={isDark ? "outline" : "surface"} size="small" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button sound={soundEnabled ? "accept" : undefined} variant="primary" size="small" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
