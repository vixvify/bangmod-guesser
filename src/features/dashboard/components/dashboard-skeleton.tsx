import { Skeleton } from "@/shared/components/ui/skeleton";
import { TableSkeleton } from "@/shared/components/ui/table-skeleton";

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl pb-8 text-surface-text">
      <div role="status" aria-label="กำลังโหลดภาพรวมระบบ" aria-busy="true">
        <span className="sr-only">กำลังโหลดภาพรวมระบบ</span>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-3 h-4 w-64" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="space-y-4 rounded-xl border border-surface-border bg-surface-overlay p-5"
            >
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-9 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="mb-4 mt-8 h-7 w-48" />
      </div>
      <TableSkeleton label="กำลังโหลดบันทึกเกม" columns={7} />
    </div>
  );
}
