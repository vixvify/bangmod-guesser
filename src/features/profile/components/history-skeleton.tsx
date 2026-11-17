import { Skeleton } from "@/shared/components/ui/skeleton";

export function HistorySkeleton() {
  return (
    <div
      role="status"
      aria-label="กำลังโหลดประวัติการเล่น"
      aria-busy="true"
      className="mt-4 space-y-3 text-surface-text"
    >
      <span className="sr-only">กำลังโหลดประวัติการเล่น</span>
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-2xl border border-surface-border bg-surface-overlay p-5"
        >
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}
