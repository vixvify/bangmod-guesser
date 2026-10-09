"use client";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_MESSAGES } from "@/core/constants/auth";
import { RegisterSchema, type RegisterInput } from "@/core/schema/auth.schema";
import httpClient, { HttpError } from "@/lib/http";
import { getAuthRedirect } from "@/lib/auth-redirect";
import { SessionRoutes } from "@/routes/api/session.routes";
import { AppRoutes } from "@/routes/app/routes";

type RegisterPageProps = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  const { callbackUrl } = use(searchParams);
  const redirectTo = getAuthRedirect(callbackUrl);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit({ name, email, password }: RegisterInput) {
    try {
      await httpClient.post<null>(SessionRoutes.register, {
        name,
        email,
        password,
      });

      toast.success(AUTH_MESSAGES.submit.registerSuccess);
      router.replace(loginHref);
    } catch (error) {
      toast.error(error instanceof HttpError && error.status === undefined
        ? AUTH_MESSAGES.submit.networkError
        : AUTH_MESSAGES.submit.registerFailed);
    }
  }

  const loginHref =
    redirectTo === AppRoutes.home
      ? AppRoutes.login
      : `${AppRoutes.login}?callbackUrl=${encodeURIComponent(redirectTo)}`;

  return (
    <>
      <header className="mb-8">
        <p className="text-xs font-extrabold tracking-[0.2em] text-primary-main">
          BANGMOD GUESSER
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          สมัครสมาชิก
        </h1>
        <p className="mt-3 text-sm leading-6 text-secondary-dark/65">
          สร้างบัญชีของคุณเพื่อร่วมสนุกกับเรา
        </p>
      </header>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
      >
        <Input
          {...register("name")}
          id="register-name"
          label="ชื่อผู้ใช้"
          autoComplete="name"
          placeholder="กรอกชื่อผู้ใช้"
          icon={<PersonOutlineRoundedIcon fontSize="small" />}
          error={errors.name?.message}
          required
        />
        <Input
          {...register("email")}
          id="register-email"
          label="อีเมล"
          type="email"
          autoComplete="email"
          placeholder="กรอกอีเมล"
          icon={<EmailOutlinedIcon fontSize="small" />}
          error={errors.email?.message}
          required
        />
        <Input
          {...register("password")}
          id="register-password"
          label="รหัสผ่าน"
          type="password"
          autoComplete="new-password"
          placeholder="กรอกรหัสผ่าน"
          icon={<LockOutlinedIcon fontSize="small" />}
          error={errors.password?.message}
          required
        />
        <Input
          {...register("confirmPassword")}
          id="register-confirm-password"
          label="ยืนยันรหัสผ่าน"
          type="password"
          autoComplete="new-password"
          placeholder="กรอกรหัสผ่านอีกครั้ง"
          icon={<VerifiedUserOutlinedIcon fontSize="small" />}
          error={errors.confirmPassword?.message}
          required
        />
        <div className="pt-6">
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || isSubmitting}
            className="min-h-12 w-full"
          >
            {isSubmitting ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-secondary-dark/65">
        มีบัญชีอยู่แล้ว?{" "}
        <Link
          href={loginHref}
          className="font-bold text-primary-main transition-colors hover:text-secondary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-main"
        >
          เข้าสู่ระบบ
        </Link>
      </p>
    </>
  );
}
