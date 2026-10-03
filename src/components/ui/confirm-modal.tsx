"use client";

import Modal from "@mui/material/Modal";
import { useId } from "react";
import { Button } from "@/components/ui/button";

type ConfirmModalProps = {
  open: boolean;
  busy?: boolean;
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
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onCancel}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} tabIndex={-1} style={{ backgroundColor: "#fff" }} className="w-full max-w-md space-y-6 rounded-2xl border border-black/10 p-6 text-secondary-dark shadow-2xl outline-none">
        <div className="space-y-2">
          <h2 id={titleId} className="text-xl font-bold">
            {title}
          </h2>
          <p id={descriptionId} className="text-sm text-neutral-500">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="surface" size="small" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant="primary" size="small" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
