"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-secondary-main px-6 py-12 text-secondary-light">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,122,47,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[auto,24px_24px]"
      />

      <section
        aria-labelledby="error-title"
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-secondary-main/80 px-7 py-10 text-center shadow-2xl shadow-black/35 backdrop-blur-sm sm:px-12 sm:py-12"
      >
        <div
          aria-hidden="true"
          className="mx-auto grid size-20 place-items-center rounded-full border border-primary-main/40 bg-primary-main/10 text-primary-main shadow-[0_0_36px_rgba(255,122,47,0.2)]"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-10 fill-none stroke-current stroke-[1.5]"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 8v4m0 4h.01" />
            <path d="M10.3 3.7 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
          </svg>
        </div>

        <p className="mt-7 font-mono text-xs uppercase tracking-[0.24em] text-primary-light">
          Connection lost
        </p>
        <h1
          id="error-title"
          className="mt-4 text-3xl font-bold leading-tight sm:text-4xl"
        >
          ระบบไม่พร้อมใช้งานชั่วคราว
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-secondary-light/60 sm:text-base">
          เกิดข้อผิดพลาดระหว่างเตรียมพื้นที่เกม กรุณาลองเชื่อมต่อใหม่อีกครั้ง
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button onClick={retry} className="sm:min-w-44">
            ลองใหม่
          </Button>
          <Button href="/" variant="outline" className="sm:min-w-44">
            กลับหน้าหลัก
          </Button>
        </div>
      </section>
    </main>
  );
}
