import Image from "next/image";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HomeBackgroundImages } from "@/core/constants/home";

export function IntroSection() {
  return (
    <section
      id="introduction"
      aria-labelledby="introduction-title"
      className="relative isolate flex min-h-svh items-center overflow-hidden bg-primary-main px-6 py-24 text-secondary-dark sm:px-12 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-64 top-1/2 size-200 -translate-y-1/2 rounded-full border border-secondary-dark/15 before:absolute before:inset-16 before:rounded-full before:border before:border-secondary-dark/15 after:absolute after:inset-32 after:rounded-full after:border after:border-secondary-dark/15"
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <ScrollReveal>
          <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
            <span className="size-2 bg-secondary-dark" />
            01 — THE CAMPUS IS YOUR PLAYGROUND
          </p>
          <p
            aria-hidden="true"
            className="mt-8 font-display text-[clamp(4rem,8vw,8rem)] uppercase leading-[0.9] tracking-tight"
          >
            Know your
            <br />
            campus<span className="text-secondary-light">?</span>
          </p>
          <h2
            id="introduction-title"
            className="mt-8 text-2xl font-bold leading-relaxed sm:text-3xl"
          >
            เกมทายสถานที่ในรั้วบางมด
          </h2>
          <p className="mt-5 max-w-lg text-base leading-8 text-secondary-dark/80">
            Bangmod Guesser ชวนคุณกลับไปมองบางมดอีกครั้ง
            ผ่านภาพของสถานที่ในมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี
            ตั้งแต่มุมโปรดไปจนถึงทางที่เดินผ่านโดยไม่ทันสังเกต
          </p>
          <p className="mt-8 border-l-2 border-secondary-dark pl-4 text-sm font-semibold">
            ไม่ต้องรู้ทุกมุม แค่ลองเชื่อความทรงจำของคุณ
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.12} className="px-3 pb-5 sm:px-8 lg:px-0">
          <figure className="relative rotate-3 border-2 border-secondary-dark bg-secondary-light p-3 shadow-[12px_12px_0_var(--color-secondary-dark)] sm:p-4">
            <div className="relative aspect-4/5 overflow-hidden bg-secondary-main">
              <Image
                src={HomeBackgroundImages[1]}
                alt="มุมหนึ่งในมหาวิทยาลัยบางมด ให้ลองสังเกตอาคารและทางเดิน"
                fill
                sizes="(min-width: 1024px) 460px, (min-width: 640px) 70vw, 90vw"
                className="object-cover"
              />
              <span
                aria-hidden="true"
                className="absolute inset-4 border border-secondary-light/40"
              />
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-secondary-light bg-secondary-main/40 font-display text-5xl text-secondary-light"
              >
                ?
              </span>
            </div>
            <figcaption className="flex items-center justify-between gap-4 px-1 pb-1 pt-4 text-sm font-bold">
              <span>จำมุมนี้ได้ไหม?</span>
              <span className="font-mono text-xs">BANGMOD / 01</span>
            </figcaption>
            <span
              aria-hidden="true"
              className="absolute -left-5 -top-5 -rotate-12 border-2 border-secondary-dark bg-primary-soft px-4 py-2 font-mono text-xs font-bold"
            >
              LOCATION UNKNOWN
            </span>
          </figure>
        </ScrollReveal>
      </div>
    </section>
  );
}
