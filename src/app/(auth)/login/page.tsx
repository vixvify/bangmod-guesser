"use client";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_MESSAGES } from "@/core/constants/auth";
import { LoginSchema, type LoginInput } from "@/core/schema/auth.schema";
import { authClient } from "@/lib/auth-client";
import { getAuthRedirect } from "@/lib/auth-redirect";
import { AppRoutes } from "@/routes/app/routes";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = use(searchParams);
  const redirectTo = getAuthRedirect(callbackUrl);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit({ email, password }: LoginInput) {
    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        toast.error(AUTH_MESSAGES.submit.loginFailed);
        return;
      }

      toast.success(AUTH_MESSAGES.submit.loginSuccess);
      router.replace(redirectTo);
      router.refresh();
    } catch {
      toast.error(AUTH_MESSAGES.submit.networkError);
    }
  }

  const registerHref =
    redirectTo === AppRoutes.home
      ? AppRoutes.register
      : `${AppRoutes.register}?callbackUrl=${encodeURIComponent(redirectTo)}`;

  return (
    <>
      <header className="mb-8">
        <p className="text-xs font-extrabold tracking-[0.2em] text-primary-main">
          BANGMOD GUESSER
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          เข้าสู่ระบบ
        </h1>
        <p className="mt-3 text-sm leading-6 text-secondary-dark/65">
          ยินดีต้อนรับกลับมา เริ่มทายสถานที่กันต่อ
        </p>
      </header>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
      >
        <Input
          {...register("email")}
          id="login-email"
          label="อีเมล"
          type="email"
          autoComplete="email"
          placeholder="กรอกอีเมลของคุณ"
          icon={<EmailOutlinedIcon fontSize="small" />}
          error={errors.email?.message}
          required
        />
        <Input
          {...register("password")}
          id="login-password"
          label="รหัสผ่าน"
          type="password"
          autoComplete="current-password"
          placeholder="กรอกรหัสผ่าน"
          icon={<LockOutlinedIcon fontSize="small" />}
          error={errors.password?.message}
          required
        />
        <p className="mt-2 text-right text-xs text-secondary-dark/45">
          ลืมรหัสผ่าน? (ยังไม่เปิดใช้งาน)
        </p>
        <div className="pt-6">
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || isSubmitting}
            className="min-h-12 w-full"
          >
            {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-secondary-dark/65">
        ยังไม่มีบัญชี?{" "}
        <Link
          href={registerHref}
          className="font-bold text-primary-main transition-colors hover:text-secondary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-main"
        >
          สมัครสมาชิก
        </Link>
      </p>
    </>
  );
}
