"use client";

import Dialog from "@mui/material/Dialog";
import { useId } from "react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  busy?: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  busy = false,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onCancel}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      slotProps={{
        paper: {
          sx: {
            width: "min(100%, 28rem)",
            border: "0.0625rem solid var(--color-primary-main)",
            borderRadius: "1rem",
            backgroundColor: "var(--color-secondary-main)",
            color: "var(--color-secondary-light)",
          },
        },
      }}
    >
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <h2 id={titleId} className="text-xl font-bold">
            {title}
          </h2>
          <p id={descriptionId} className="text-sm text-secondary-light/75">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" size="small" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button size="small" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
