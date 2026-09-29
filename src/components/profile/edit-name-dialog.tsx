"use client";

import Dialog from "@mui/material/Dialog";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROFILE_MESSAGES } from "@/core/constants/profile";

type EditNameDialogProps = {
  open: boolean;
  username: string;
  onClose: () => void;
  onSave: (username: string) => void;
};

export function EditNameDialog({
  open,
  username,
  onClose,
  onSave,
}: EditNameDialogProps) {
  const titleId = useId();
  const [draft, setDraft] = useState(username);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextUsername = draft.trim();

    if (!nextUsername) {
      setError(PROFILE_MESSAGES.usernameRequired);
      return;
    }

    onSave(nextUsername);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      slotProps={{
        transition: {
          onEnter: () => {
            setDraft(username);
            setError("");
          },
        },
        paper: {
          sx: {
            width: "min(100%, 28rem)",
            borderRadius: "1rem",
            backgroundColor: "#fff",
            color: "var(--color-secondary-dark)",
          },
        },
      }}
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div>
          <h2 id={titleId} className="text-xl font-bold text-secondary-dark">
            แก้ไขชื่อผู้ใช้
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            ชื่อที่แสดงบนหน้าโปรไฟล์ของคุณ
          </p>
        </div>
        <hr className="mb-6 mt-4 border-t border-neutral-200" />
        <Input
          id="profile-username"
          label="ชื่อผู้ใช้"
          autoFocus
          size="small"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              onClose();
            }
          }}
          error={error}
          inputProps={{ maxLength: 50 }}
        />
        <div className="mt-8 flex justify-end gap-3 pt-2">
          <Button type="button" variant="surface" size="small" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="primary" size="small">
            บันทึก
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
