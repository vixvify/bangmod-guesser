import type { ReactNode } from "react";
import { BackgroundSlideshow } from "@/components/home/background-slideshow";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import type { User } from "@/core/domain/user";

type HomeLayoutProps = {
  children: ReactNode;
  user: User | null;
};

export function HomeLayout({ children, user }: HomeLayoutProps) {
  return (
    <main className="relative isolate flex min-h-svh flex-col overflow-hidden bg-secondary-main text-secondary-light">
      <BackgroundSlideshow />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-secondary-main/25" />
      <div aria-hidden="true" className="lobby-vignette pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 9 }, (_, index) => (
          <span key={index} className="absolute bottom-0 size-1 rounded-full bg-primary-soft/60 opacity-0 shadow-[0_0_12px_var(--color-primary-main)] motion-safe:animate-lobby-drift" style={{ left: `${8 + index * 11}%`, animationDelay: `${index * -2.3}s`, animationDuration: `${14 + index % 3 * 4}s` }} />
        ))}
      </div>

      <Navbar user={user} />

      <div className="relative flex flex-1 items-center px-6 py-5">
        {children}
      </div>
      <Footer />
    </main>
  );
}
