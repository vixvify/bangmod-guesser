"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { AppRoutes } from "@/routes/app/routes";

export function LobbyMenu() {
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();
  const enterGame = useCallback(() => router.push(AppRoutes.game), [router]);

  return (
    <div className="mx-auto mt-8 w-full max-w-80 motion-safe:animate-home-enter motion-safe:[animation-delay:240ms]">
      <div className="relative -rotate-2 rounded-[18px] border border-primary-soft/35 p-1.5">
        <Button
          disabled={isStarting}
          onClick={() => setIsStarting(true)}
          aria-label="Play Bangmod Guesser"
          className="relative isolate min-h-16.5 w-full overflow-hidden rounded-xl! border-2 border-primary-light bg-linear-to-b from-primary-hover to-primary-main shadow-[0_5px_0_var(--color-secondary-dark),inset_0_2px_0_var(--color-primary-soft)]! enabled:hover:brightness-110 focus-visible:brightness-110 disabled:opacity-100 motion-safe:enabled:hover:-translate-y-1 motion-safe:enabled:hover:scale-[1.025] motion-safe:enabled:active:translate-y-1 motion-safe:enabled:active:scale-[0.985] motion-safe:focus-visible:-translate-y-1 motion-reduce:transition-none"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-y-6 -left-1/2 w-1/3 -skew-x-12 bg-secondary-light/25 opacity-0 motion-safe:transition-[translate,opacity] motion-safe:duration-500 motion-safe:group-hover:translate-x-[550%] motion-safe:group-hover:opacity-100 motion-safe:group-focus-visible:translate-x-[550%] motion-safe:group-focus-visible:opacity-100 group-disabled:hidden"
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="relative size-5 fill-current motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1 group-disabled:translate-x-0"
          >
            <path d="M6 3v18l15-9Z" />
          </svg>
          <span className="font-display text-3xl tracking-[0.12em]">PLAY</span>
        </Button>
      </div>
      {isStarting && <Countdown onComplete={enterGame} />}
    </div>
  );
}
