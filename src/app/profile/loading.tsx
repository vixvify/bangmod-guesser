import { PublicLoadingShell } from "@/shared/components/layout/public-loading-shell";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { HistorySkeleton } from "@/features/profile/components/history-skeleton";

export default function ProfileLoading() {
  return (
    <PublicLoadingShell>
      <div
        role="status"
        aria-label="กำลังโหลดโปรไฟล์"
        aria-busy="true"
        className="text-surface-text"
      >
        <span className="sr-only">กำลังโหลดโปรไฟล์</span>
        <div
          aria-hidden="true"
          className="flex items-center gap-5 rounded-3xl border border-surface-border bg-surface-overlay p-8"
        >
          <Skeleton className="size-20 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56 max-w-full" />
          </div>
        </div>
        <div className="mt-5 rounded-3xl border border-surface-border bg-surface-overlay p-5">
          <Skeleton className="h-7 w-48" />
          <HistorySkeleton />
        </div>
      </div>
    </PublicLoadingShell>
  );
}
