import { HomeBackdrop } from "@/components/home/home-backdrop";
import { LobbyEmblem } from "@/components/home/lobby-emblem";
import { LobbyMenu } from "@/components/home/lobby-menu";

export function LobbySection() {
  return (
    <section
      aria-label="Bangmod Guesser lobby"
      className="relative isolate flex min-h-[90svh] items-center overflow-hidden px-6 pt-20 pb-12 text-center sm:min-h-[90svh] sm:px-10 sm:pt-24 sm:pb-16 lg:min-h-[95svh]"
    >
      <HomeBackdrop />
      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <div className="motion-safe:animate-home-enter">
          <LobbyEmblem />
        </div>
        <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.35em] text-primary-soft sm:text-xs">
          Your campus. Your playground.
        </p>
        <h1 className="lobby-title mt-4 -rotate-3 font-display uppercase leading-[0.82] tracking-tight motion-safe:animate-home-enter">
          <span className="block text-[clamp(3.2rem,min(16vw,12svh),7rem)] text-secondary-light">
            Bangmod
          </span>
          <span className="mt-2 block text-[clamp(3.6rem,min(18vw,14svh),8rem)] text-primary-main">
            Guesser
          </span>
        </h1>
        <p className="mt-7 text-sm text-secondary-light/80 sm:text-base">
          เดินผ่านทุกวัน… แล้วจำได้แค่ไหน?
        </p>
        <LobbyMenu />
        <a
          href="#introduction"
          className="mt-8 inline-flex flex-col items-center gap-1 text-xs text-secondary-light/55 transition-colors hover:text-secondary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus"
        >
          <span>เลื่อนลงเพื่อทำความรู้จักเกม</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5 fill-none stroke-current stroke-2 motion-safe:animate-bounce"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </a>
      </div>
    </section>
  );
}
