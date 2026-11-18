import { PublicLoadingShell } from "@/shared/components/layout/public-loading-shell";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function LeaderboardLoading() {
  return (
    <PublicLoadingShell>
      <section
        role="status"
        aria-label="กำลังโหลดอันดับผู้เล่น"
        aria-busy="true"
        className="min-h-[calc(100svh-12rem)] rounded-3xl border border-surface-border bg-surface-overlay p-4 text-surface-text sm:p-9"
      >
        <span className="sr-only">กำลังโหลดอันดับผู้เล่น</span>
        <Skeleton className="h-8 w-48" />
        <div
          aria-hidden="true"
          className="mt-12 grid grid-cols-3 items-end gap-3 sm:gap-5"
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="space-y-4 rounded-2xl border border-surface-border p-5"
            >
              <Skeleton className="mx-auto size-16 rounded-full" />
              <Skeleton className="mx-auto h-5 w-3/4" />
              <Skeleton className="mx-auto h-8 w-full" />
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
