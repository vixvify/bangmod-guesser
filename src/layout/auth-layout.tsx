import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppRoutes } from "@/routes/app/routes";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="grid min-h-svh bg-secondary-light md:grid-cols-[3fr_2fr]">
      <div className="relative min-h-56 overflow-hidden bg-secondary-dark md:min-h-svh">
        <Image
          src="/images/kmutt-bangmod-1.jpg"
          alt="บรรยากาศภายในมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี วิทยาเขตบางมด"
          fill
          priority
          sizes="(min-width: 48rem) 60vw, 100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-t from-secondary-main/85 via-secondary-main/20 to-secondary-main/10" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-secondary-light sm:p-10">
          <p className="text-xs font-bold tracking-[0.3em] text-primary-light">
            KMUTT · BANGMOD
          </p>
          <p className="mt-3 font-display text-4xl uppercase leading-none sm:text-5xl">
            YOUR CAMPUS.
            <br />
            YOUR PLAYGROUND.
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col px-6 py-6 text-secondary-dark sm:px-8 sm:py-8 lg:px-10 xl:px-12">
        <Link
          href={AppRoutes.home}
          className="inline-flex w-fit items-center gap-2 rounded-sm text-sm font-medium text-secondary-dark/65 transition-colors hover:text-primary-main focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-main"
        >
          <ArrowBackRoundedIcon fontSize="small" aria-hidden="true" />
          ย้อนกลับ
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-lg">{children}</div>
        </div>
      </div>
    </main>
  );
}
