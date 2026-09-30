"use client";

import Dialog from "@mui/material/Dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROFILE_MESSAGES } from "@/core/constants/profile";
import {
  UpdateUsernameFormSchema,
  type UpdateUsernameFormInput,
} from "@/core/schema/profile.schema";

type EditNameDialogProps = {
  open: boolean;
  username: string;
  onClose: () => void;
  onSave: (username: string) => Promise<boolean>;
};

export function EditNameDialog({
  open,
  username,
  onClose,
  onSave,
}: EditNameDialogProps) {
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

  async function onSubmit({ username: nextUsername }: UpdateUsernameFormInput) {
    if (await onSave(nextUsername)) onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      aria-labelledby={titleId}
      slotProps={{
        transition: {
          onEnter: () => {
            reset({ username });
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
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="p-6">
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
    </Dialog>
  );
}
