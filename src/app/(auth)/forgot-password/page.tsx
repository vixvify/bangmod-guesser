"use client";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_MESSAGES } from "@/core/constants/auth";
import {
  RequestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@/core/schema/auth.schema";
import { AppRoutes } from "@/routes/app/routes";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(RequestPasswordResetSchema),
    mode: "onChange",
    defaultValues: { email: "" },
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
          <Button type="submit" variant="primary" disabled={!isValid} className="min-h-12 w-full">
            ขอลิงก์เปลี่ยนรหัสผ่าน
          </Button>
        </div>
      </form>
      <p className="mt-8 text-center text-sm">
        <Link
          href={AppRoutes.login}
          className="font-bold text-primary-main transition-colors hover:text-secondary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-main"
        >
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </p>
    </>
  );
}
