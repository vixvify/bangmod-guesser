import { Skeleton } from "@/shared/components/ui/skeleton";
import { TableSkeleton } from "@/shared/components/ui/table-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl text-surface-text">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="mb-2 mt-6 h-9 w-40" />
      <Skeleton className="mb-8 h-4 w-64" />
      <TableSkeleton label="กำลังโหลดผู้ใช้" columns={5} />
    </div>
  );
}
