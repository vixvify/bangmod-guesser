import type { ReactNode } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ContentContainer } from "./content-container";

export function PublicLoadingShell({ children }: { children: ReactNode }) {
  return <div className="player-page-background relative flex min-h-svh flex-col bg-secondary-main text-surface-text">
    <header aria-hidden="true" className="absolute inset-x-0 top-0 h-16"><ContentContainer contentWidth="full" className="flex h-full items-center justify-between"><Skeleton className="h-6 w-40" /><div className="flex gap-2"><Skeleton className="size-10" /><Skeleton className="size-10" /><Skeleton className="size-10" /></div></ContentContainer></header>
    <main className="flex flex-1 flex-col"><ContentContainer contentWidth="wide" className="pb-16 pt-24 sm:pt-28">{children}</ContentContainer></main>
  </div>;
}
