"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { User } from "@/core/domain/user";
import { AuthRoutes } from "@/routes/api/auth.routes";
import { AppRoutes } from "@/routes/app/routes";
import { Button } from "@/components/ui/button";
import { httpClient } from "@/lib/http";

type NavbarProps = {
  user: User | null;
};

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await httpClient.post<void>(AuthRoutes.logout);
      router.refresh();
    } catch {
      return;
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="absolute inset-x-0 top-0 z-50 flex w-full flex-wrap items-center justify-end gap-3 px-5 py-5 sm:px-10 sm:py-6">
      <nav aria-label="Home navigation" className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled
          aria-label="Game settings — coming soon"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5 fill-none stroke-current stroke-2"
          >
            <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
            <path d="M3.5 13.1v-2.2l2.1-.7c.2-.7.5-1.3.8-1.8l-1-2 1.6-1.6 2 1c.6-.4 1.2-.6 1.9-.8l.7-2.1h2.2l.7 2.1c.7.2 1.3.5 1.8.8l2-1 1.6 1.6-1 2c.4.6.6 1.2.8 1.9l2.1.7v2.2l-2.1.7c-.2.7-.5 1.3-.8 1.8l1 2-1.6 1.6-2-1c-.6.4-1.2.6-1.9.8l-.7 2.1h-2.2l-.7-2.1c-.7-.2-1.3-.5-1.8-.8l-2 1-1.6-1.6 1-2c-.4-.6-.6-1.2-.8-1.9l-2.1-.7Z" />
          </svg>
        </Button>

        {user ? (
          <>
            <Link
              href={AppRoutes.profile}
              className="flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-secondary-main/35 px-2 pr-3 text-sm font-semibold text-secondary-light backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus"
            >
              <span className="grid h-6 w-6 place-items-center rounded-md bg-primary-main text-xs font-bold text-secondary-dark">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="hidden max-w-32 truncate sm:inline">
                {user.name}
              </span>
            </Link>
            <Button
              variant="ghost"
              size="small"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="disabled:cursor-wait disabled:opacity-60"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </>
        ) : (
          <Button
            href={AppRoutes.login}
            size="small"
            className="h-10 px-4 text-sm font-bold"
          >
            Login
          </Button>
        )}
      </nav>
    </header>
  );
}
