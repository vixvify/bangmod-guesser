"use client";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { AUTH_MESSAGES, BANNED_USER_CODE, EMAIL_NOT_VERIFIED_CODE } from "@/features/auth/auth.constants";
import { getSuspensionMessage } from "@/features/auth/login-suspension";
import { LoginSchema, type LoginInput } from "@/features/auth/auth.schema";
import httpClient, { HttpError } from "@/shared/lib/http";
import { getErrorMessage, getHttpErrorCode } from "@/shared/lib/error-message";
import { getAuthRedirect } from "@/features/auth/auth-redirect";
import { SessionRoutes } from "@/features/auth/session.routes";
import { AppRoutes } from "@/shared/routes/routes";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
    error?: string | string[];
    error_description?: string | string[];
    verification?: string | string[];
  }>;
};

const GOOGLE_LOGIN_ERROR_TOAST_ID = "google-login-error";

export default function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, error, error_description: errorDescription, verification } = use(searchParams);
  const redirectTo = getAuthRedirect(callbackUrl);
  const router = useRouter();
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const displayedGoogleError = useRef<typeof error>(undefined);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit({ email, password }: LoginInput) {
    try {
      await httpClient.post<null>(SessionRoutes.login, { email, password });

      toast.success(AUTH_MESSAGES.submit.loginSuccess);
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      const errorCode = getHttpErrorCode(error);
      if (errorCode === BANNED_USER_CODE) {
        toast.error(getSuspensionMessage(error instanceof HttpError ? error.data : undefined));
        return;
      }
      if (errorCode === EMAIL_NOT_VERIFIED_CODE) {
        toast.error(AUTH_MESSAGES.submit.emailNotVerified, { id: "email-verification" });
        return;
      }
      toast.error(getErrorMessage(error, AUTH_MESSAGES.submit.loginFailed, {
        401: AUTH_MESSAGES.submit.loginFailed,
      }));
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
    if (verification === "email") {
      const options = { id: "email-verification" };
      if (error) toast.error(AUTH_MESSAGES.submit.emailVerificationFailed, options);
      else toast.success(AUTH_MESSAGES.submit.emailVerificationSuccess, options);
      return;
    }
    if (!error) return;
    const message = error === BANNED_USER_CODE
      ? getSuspensionMessage({ banExpires: errorDescription }, AUTH_MESSAGES.submit.googleLoginSuspended)
      : AUTH_MESSAGES.submit.googleLoginFailed;
    if (displayedGoogleError.current === message) return;
    displayedGoogleError.current = message;
    toast.error(message, { id: GOOGLE_LOGIN_ERROR_TOAST_ID });
  }, [error, errorDescription, verification]);

  async function onGoogleSignIn() {
    setIsGoogleSubmitting(true);

    try {
      const { data } = await httpClient.post<{ url: string }>(SessionRoutes.googleLogin, {
        callbackURL: redirectTo,
        errorCallbackURL: loginHref,
      });
      window.location.assign(data.url);
    } catch (error) {
      toast.error(getErrorMessage(error, AUTH_MESSAGES.submit.googleLoginFailed, {
        400: AUTH_MESSAGES.submit.googleLoginFailed,
      }), { id: GOOGLE_LOGIN_ERROR_TOAST_ID });
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <>
      <header className="mb-8">
        <p className="text-xs font-extrabold tracking-[0.2em] text-primary-ink">
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
            className="text-secondary-dark/65 transition-colors hover:text-primary-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
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
        <span className="text-xs text-secondary-dark/75">หรือ</span>
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
            <Image src="/logo/google.webp" alt="" width={20} height={20} style={{ width: 20, height: "auto" }} />
            <span>เข้าสู่ระบบด้วย Google</span>
          </span>
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-secondary-dark/65">
        ยังไม่มีบัญชี?{" "}
        <Link
          href={registerHref}
          className="font-bold text-primary-ink transition-colors hover:text-secondary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
        >
          สมัครสมาชิก
        </Link>
      </p>
    </>
  );
}
