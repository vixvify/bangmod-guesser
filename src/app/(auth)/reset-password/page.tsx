"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_MESSAGES } from "@/core/constants/auth";
import { ResetPasswordSchema, type ResetPasswordInput } from "@/core/schema/auth.schema";

export default function ResetPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  function onSubmit() {
    toast.info(AUTH_MESSAGES.submit.passwordResetUnavailable);
  }

  return (
    <>
      <header className="mb-8">
        <p className="text-xs font-extrabold tracking-[0.2em] text-primary-main">
          BANGMOD GUESSER
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          เปลี่ยนรหัสผ่าน
        </h1>
        <p className="mt-3 text-sm leading-6 text-secondary-dark/65">
          ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ
        </p>
      </header>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <Input
          {...register("password")}
          id="reset-password"
          label="รหัสผ่านใหม่"
          type="password"
          autoComplete="new-password"
          placeholder="กรอกรหัสผ่านใหม่"
          icon={<LockOutlinedIcon fontSize="small" />}
          error={errors.password?.message}
          required
        />
        <Input
          {...register("confirmPassword")}
          id="reset-confirm-password"
          label="ยืนยันรหัสผ่านใหม่"
          type="password"
          autoComplete="new-password"
          placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
          icon={<VerifiedUserOutlinedIcon fontSize="small" />}
          error={errors.confirmPassword?.message}
          required
        />
        <div className="pt-6">
          <Button type="submit" variant="primary" disabled={!isValid} className="min-h-12 w-full">
            บันทึกรหัสผ่านใหม่
          </Button>
        </div>
      </form>

    </>
  );
}
