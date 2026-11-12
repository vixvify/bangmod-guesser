"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { AUTH_MESSAGES } from "@/features/auth/auth.constants";
import { ResetPasswordSchema, type ResetPasswordInput } from "@/features/auth/auth.schema";
import { AppRoutes } from "@/shared/routes/routes";
import { SessionRoutes } from "@/features/auth/session.routes";
import httpClient from "@/shared/lib/http";
import { getErrorMessage } from "@/shared/lib/error-message";

export default function ResetPasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(input: ResetPasswordInput) {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      toast.error(AUTH_MESSAGES.submit.passwordResetInvalidLink);
      return;
    }

    try {
      await httpClient.post<null>(SessionRoutes.resetPassword, {
        token,
        password: input.password,
        confirmPassword: input.confirmPassword,
      });

      toast.success(AUTH_MESSAGES.submit.passwordResetSuccess);
      router.push(AppRoutes.login);
    } catch (error) {
      toast.error(
        getErrorMessage(error, AUTH_MESSAGES.submit.passwordResetFailed, {
          400: AUTH_MESSAGES.submit.passwordResetFailed,
        }),
      );
    }
  }

  return (
    <>
      <header className="mb-8">
        <p className="text-xs font-extrabold tracking-[0.2em] text-primary-ink">
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
          <Button type="submit" variant="primary" disabled={!isValid || isSubmitting} className="min-h-12 w-full">
            {isSubmitting ? "กำลังบันทึกรหัสผ่าน" : "บันทึกรหัสผ่านใหม่"}
          </Button>
        </div>
      </form>
      <p className="mt-8 text-center text-sm">
        <Link
          href={AppRoutes.login}
          className="font-bold text-primary-ink transition-colors hover:text-secondary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
        >
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </p>
    </>
  );
}
