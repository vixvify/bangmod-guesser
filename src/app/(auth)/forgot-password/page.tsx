"use client";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { AUTH_MESSAGES } from "@/features/auth/auth.constants";
import {
  RequestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@/features/auth/auth.schema";
import { AppRoutes } from "@/shared/routes/routes";
import { SessionRoutes } from "@/features/auth/session.routes";
import httpClient, { HttpError } from "@/shared/lib/http";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(RequestPasswordResetSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  async function onSubmit({ email }: RequestPasswordResetInput) {
    try {
      await httpClient.post<null>(SessionRoutes.forgotPassword, { email });

      toast.success(AUTH_MESSAGES.submit.passwordResetRequestSuccess);
    } catch (error) {
      toast.error(
        error instanceof HttpError && error.status === undefined
          ? AUTH_MESSAGES.submit.networkError
          : AUTH_MESSAGES.submit.passwordResetRequestFailed,
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
          ลืมรหัสผ่าน
        </h1>
        <p className="mt-3 text-sm leading-6 text-secondary-dark/65">
          กรอกอีเมลที่ใช้สมัครบัญชีเพื่อขอลิงก์เปลี่ยนรหัสผ่าน
        </p>
      </header>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <Input
          {...register("email")}
          id="forgot-password-email"
          label="อีเมล"
          type="email"
          autoComplete="email"
          placeholder="กรอกอีเมลของคุณ"
          icon={<EmailOutlinedIcon fontSize="small" />}
          error={errors.email?.message}
          required
        />
        <div className="pt-6">
          <Button type="submit" variant="primary" disabled={!isValid || isSubmitting} className="min-h-12 w-full">
            {isSubmitting ? "กำลังส่งคำขอ..." : "ขอลิงก์เปลี่ยนรหัสผ่าน"}
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
