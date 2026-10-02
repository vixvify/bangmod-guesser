"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { UserStatusPicker } from "@/components/admin/user-status-picker";
import type { UserAccount } from "@/core/domain/user";
import { UserRole } from "@/core/domain/user";
import {
  UserFormSchema,
  type UserFormInput,
} from "@/core/schema/user.schema";
import { getProfileImageUrl } from "@/lib/profile-image";

type EditUserModalProps = {
  user: UserAccount;
  onClose: () => void;
  onSave: (values: UserFormInput) => void;
};

export function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const titleId = useId();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<UserFormInput>({
    resolver: zodResolver(UserFormSchema),
    mode: "onChange",
    defaultValues: {
      name: user.name,
      role: user.role,
      status: user.status,
      suspension: user.suspension,
      reason: user.reason,
    },
  });
  const selectedRole = useWatch({ control, name: "role" });
  const selectedStatus = useWatch({ control, name: "status" });

  return (
    <Modal
      open
      onClose={onClose}
      aria-labelledby={titleId}
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
        aria-labelledby={titleId}
        tabIndex={-1}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 text-secondary-dark shadow-2xl outline-none sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-2xl font-bold">
              แก้ไขผู้ใช้
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              แก้ไขข้อมูล บทบาท และสถานะบัญชี
            </p>
          </div>
          <IconButton aria-label="ปิดหน้าต่าง" onClick={onClose} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </div>
        <hr className="my-5 border-slate-200" />

        <form noValidate onSubmit={handleSubmit(onSave)} className="space-y-6">
          <section
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
            aria-labelledby="managed-user-info"
          >
            <h3
              id="managed-user-info"
              className="text-sm font-semibold text-slate-600"
            >
              ข้อมูลบัญชี
            </h3>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar
                src={getProfileImageUrl(user.image)}
                alt={user.name}
                sx={{
                  width: "4rem",
                  height: "4rem",
                  flexShrink: 0,
                  bgcolor: "var(--color-primary-soft)",
                  color: "var(--color-secondary-dark)",
                  fontWeight: 700,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
                <Input
                  id="managed-username"
                  label="ชื่อผู้ใช้"
                  size="small"
                  {...register("name", {
                    setValueAs: (value: string) => value.trim(),
                  })}
                  error={errors.name?.message}
                  inputProps={{ maxLength: 50 }}
                />
                <Input
                  id="managed-email"
                  label="อีเมล"
                  value={user.email}
                  disabled
                  readOnly
                  size="small"
                />
              </div>
            </div>
          </section>

          <section aria-labelledby="managed-user-role">
            <h3
              id="managed-user-role"
              className="mb-3 text-sm font-semibold text-secondary-dark"
            >
              บทบาท
            </h3>
            <div className="flex max-w-md gap-3">
              {([UserRole.USER, UserRole.ADMIN] as const).map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant={selectedRole === role ? "primary" : "surface"}
                  size="small"
                  className="flex-1"
                  aria-pressed={selectedRole === role}
                  onClick={() =>
                    setValue("role", role, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  {role === UserRole.USER ? "ผู้เล่น" : "ผู้ดูแล"}
                </Button>
              ))}
            </div>
          </section>

          <section aria-labelledby="managed-user-status">
            <h3
              id="managed-user-status"
              className="mb-3 text-sm font-semibold text-secondary-dark"
            >
              สถานะบัญชี
            </h3>
            <UserStatusPicker
              value={selectedStatus}
              onChange={(value) =>
                setValue("status", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </section>

          {selectedStatus !== "ACTIVE" && (
            <div className="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
              {selectedStatus === "TEMPORARY" && (
                <Controller
                  name="suspension"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <DateRangePicker
                        label="ระยะเวลาการระงับ"
                        defaultValue={field.value}
                        onChange={field.onChange}
                      />
                      {errors.suspension && (
                        <p role="alert" className="mt-1 text-xs text-red-600">
                          {errors.suspension.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              )}
              <div
                className={
                  selectedStatus === "TEMPORARY" ? "" : "sm:col-span-2"
                }
              >
                <Input
                  id="managed-reason"
                  label="เหตุผล (ไม่บังคับ)"
                  placeholder="ระบุเหตุผล เช่น สแปมคะแนน"
                  size="small"
                  {...register("reason")}
                  error={errors.reason?.message}
                  inputProps={{ maxLength: 200 }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <Button
              type="button"
              variant="surface"
              size="small"
              onClick={onClose}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="small"
              disabled={!isDirty || !isValid}
            >
              บันทึก
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
