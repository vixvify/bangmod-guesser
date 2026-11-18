import { Skeleton } from "@/shared/components/ui/skeleton";
import { TableSkeleton } from "@/shared/components/ui/table-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl text-surface-text">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="mb-2 mt-6 h-9 w-44" />
      <Skeleton className="mb-8 h-4 w-72" />
      <TableSkeleton label="กำลังโหลดสถานที่" columns={4} />
    </div>
  );
}
