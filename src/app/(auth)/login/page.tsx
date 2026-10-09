"use client";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_MESSAGES } from "@/core/constants/auth";
import { LoginSchema, type LoginInput } from "@/core/schema/auth.schema";
import httpClient, { HttpError } from "@/lib/http";
import { getAuthRedirect } from "@/lib/auth-redirect";
import { SessionRoutes } from "@/routes/api/session.routes";
import { AppRoutes } from "@/routes/app/routes";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
    error?: string | string[];
  }>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, error } = use(searchParams);
  const redirectTo = getAuthRedirect(callbackUrl);
  const router = useRouter();
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
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
      await httpClient.post<null>(SessionRoutes.login, { email, password });

      toast.success(AUTH_MESSAGES.submit.loginSuccess);
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof HttpError && error.status === undefined
        ? AUTH_MESSAGES.submit.networkError
        : AUTH_MESSAGES.submit.loginFailed);
    }
  }

  const registerHref =
    redirectTo === AppRoutes.home
      ? AppRoutes.register
      : `${AppRoutes.register}?callbackUrl=${encodeURIComponent(redirectTo)}`;

  const loginHref =
    redirectTo === AppRoutes.home
      ? AppRoutes.login
      : `${AppRoutes.login}?callbackUrl=${encodeURIComponent(redirectTo)}`;

  useEffect(() => {
    if (error) {
      toast.error(AUTH_MESSAGES.submit.googleLoginFailed);
    }
  }, [error]);

  async function onGoogleSignIn() {
    setIsGoogleSubmitting(true);

    try {
      const { data } = await httpClient.post<{ url: string }>(SessionRoutes.googleLogin, {
        callbackURL: redirectTo,
        errorCallbackURL: loginHref,
      });
      window.location.assign(data.url);
    } catch (error) {
      toast.error(error instanceof HttpError && error.status === undefined
        ? AUTH_MESSAGES.submit.networkError
        : AUTH_MESSAGES.submit.googleLoginFailed);
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

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
        <p className="mt-2 text-right text-xs">
          <Link
            href={AppRoutes.forgotPassword}
            className="text-secondary-dark/65 transition-colors hover:text-primary-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-main"
          >
            ลืมรหัสผ่าน?
          </Link>
        </p>
        <div className="pt-6">
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || isSubmitting || isGoogleSubmitting}
            className="min-h-12 w-full"
          >
            {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </div>
      </form>

      <div className="mt-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-secondary-dark/15" />
        <span className="text-xs text-secondary-dark/50">หรือ</span>
        <span className="h-px flex-1 bg-secondary-dark/15" />
      </div>

      <div className="mt-7">
        <Button
          type="button"
          variant="surface"
          size="small"
          disabled={isGoogleSubmitting || isSubmitting}
          onClick={onGoogleSignIn}
          className="min-h-12 w-full"
        >
          <span className="inline-flex items-center gap-4">
            <Image src="/logo/google.webp" alt="" width={20} height={20} />
            <span>เข้าสู่ระบบด้วย Google</span>
          </span>
        </Button>
      </div>

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
