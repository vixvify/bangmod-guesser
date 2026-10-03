"use client";

import Modal from "@mui/material/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROFILE_MESSAGES } from "@/core/constants/profile";
import {
  UpdateUsernameFormSchema,
  type UpdateUsernameFormInput,
} from "@/core/schema/profile.schema";

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
  const {
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

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      aria-labelledby={titleId}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
    >
      <form role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} noValidate onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-2xl bg-white p-6 text-secondary-dark shadow-2xl outline-none">
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
          {...register("username", { setValueAs: (value: string) => value.trim() })}
          id="profile-username"
          label="ชื่อผู้ใช้"
          autoFocus
          size="small"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !isSubmitting) {
              event.stopPropagation();
              onClose();
            }
          }}
          error={errors.username?.message}
          inputProps={{ maxLength: 50 }}
        />
        <div className="mt-8 flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="surface"
            size="small"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <Button
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
  );
}
