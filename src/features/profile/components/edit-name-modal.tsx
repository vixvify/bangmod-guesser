"use client";

import Modal from "@mui/material/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { ConfirmModal } from "@/shared/components/ui/confirm-modal";
import { Input } from "@/shared/components/ui/input";
import { PROFILE_MESSAGES } from "@/features/profile/profile.constants";
import {
  UpdateUsernameFormSchema,
  type UpdateUsernameFormInput,
} from "@/features/profile/profile.schema";

type EditNameModalProps = {
  open: boolean;
  username: string;
  onClose: () => void;
  onSave: (username: string) => Promise<boolean>;
};

export function EditNameModal({
  open,
  username,
  onClose,
  onSave,
}: EditNameModalProps) {
  const titleId = useId();
  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false);
  const {
    getValues,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<UpdateUsernameFormInput>({
    resolver: zodResolver(UpdateUsernameFormSchema),
    mode: "onChange",
    defaultValues: { username },
  });
  const canSave = isDirty && isValid && !isSubmitting;

  useEffect(() => {
    if (open) reset({ username });
  }, [open, reset, username]);

  async function onSubmit({ username: nextUsername }: UpdateUsernameFormInput) {
    if (await onSave(nextUsername)) onClose();
  }

  function requestClose() {
    if (isSubmitting) return;
    if (getValues("username").trim() !== username.trim()) {
      setDiscardConfirmationOpen(true);
    } else {
      onClose();
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={requestClose}
        aria-labelledby={titleId}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
      >
        <form role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} noValidate onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-2xl border border-surface-border bg-secondary-main p-6 text-surface-text shadow-2xl outline-none">
          <div>
            <h2 id={titleId} className="text-2xl font-bold text-surface-text">
              แก้ไขชื่อผู้ใช้
            </h2>
            <p className="mt-1 text-sm text-surface-muted">
              ชื่อที่แสดงบนหน้าโปรไฟล์ของคุณ
            </p>
          </div>
          <hr className="mb-6 mt-4 border-t border-surface-border" />
          <Input
            {...register("username", { setValueAs: (value: string) => value.trim() })}
            id="profile-username"
            theme="dark"
            label="ชื่อผู้ใช้"
            autoFocus
            size="small"
            error={errors.username?.message}
          />
          <div className="mt-8 flex justify-end gap-3 pt-2">
            <Button
              sound="click"
              type="button"
              variant="outline"
              size="small"
              onClick={requestClose}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button
              sound="accept"
              type="submit"
              variant="primary"
              size="small"
              disabled={!canSave}
            >
              {isSubmitting ? PROFILE_MESSAGES.saving : "บันทึก"}
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmModal
        theme="dark"
        soundEnabled
        open={open && discardConfirmationOpen}
        title={PROFILE_MESSAGES.discardConfirm.title}
        description={PROFILE_MESSAGES.discardConfirm.description}
        confirmLabel={PROFILE_MESSAGES.discardConfirm.confirm}
        cancelLabel={PROFILE_MESSAGES.discardConfirm.cancel}
        onConfirm={() => {
          setDiscardConfirmationOpen(false);
          onClose();
        }}
        onCancel={() => setDiscardConfirmationOpen(false)}
      />
    </>
  );
}
