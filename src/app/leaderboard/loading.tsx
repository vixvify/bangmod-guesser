import { PublicLoadingShell } from "@/shared/components/layout/public-loading-shell";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function LeaderboardLoading() {
  return (
    <PublicLoadingShell>
      <section
        role="status"
        aria-label="กำลังโหลดอันดับผู้เล่น"
        aria-busy="true"
        className="player-page-panel min-h-[calc(100svh-12rem)] rounded-3xl border border-surface-border bg-surface-overlay p-3 text-surface-text sm:p-6 lg:p-9"
      >
        <span className="sr-only">กำลังโหลดอันดับผู้เล่น</span>
        <Skeleton className="h-8 w-48" />
        <div
          aria-hidden="true"
          className="mt-5 grid grid-cols-1 gap-2 sm:mt-14 sm:grid-cols-3 sm:items-end sm:gap-5"
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`grid grid-cols-[2rem_minmax(0,1fr)_2.25rem] items-center gap-2 rounded-2xl border border-surface-border p-3 sm:flex sm:flex-col sm:gap-4 sm:p-5 ${i === 1 ? "sm:order-2" : i === 2 ? "sm:order-1" : "sm:order-3"}`}
            >
              <Skeleton className="size-8 rounded-full sm:size-16" />
              <div className="w-full space-y-2">
                <Skeleton className="h-4 w-3/4 sm:mx-auto" />
                <Skeleton className="h-3 w-1/2 sm:mx-auto" />
              </div>
              <Skeleton className="size-9 sm:h-7 sm:w-1/2" />
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <Skeleton className="mt-5 h-16 w-full" />
      </section>
    </PublicLoadingShell>
  );
}
