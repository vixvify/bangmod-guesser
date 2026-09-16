import { LobbyEmblem } from "@/components/home/lobby-emblem";
import { LobbyMenu } from "@/components/home/lobby-menu";
import { HomeLayout } from "@/layout/home-layout";
import type { User } from "@/core/domain/user";
import { AppError } from "@/core/errors/app.error";
import { authCheck } from "@/lib/auth-check";

export default async function Page() {
  const user = await authCheck().catch((error: unknown): User | null => {
    if (error instanceof AppError && error.status === 401) {
      return null;
    }

    throw error;
  });

  return (
    <HomeLayout user={user}>
      <section
        aria-label="Bangmod Guesser lobby"
        className="relative mx-auto w-full max-w-3xl text-center"
      >
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
      </section>
    </HomeLayout>
  );
}
