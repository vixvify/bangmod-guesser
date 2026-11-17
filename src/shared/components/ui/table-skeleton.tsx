import { Skeleton } from "./skeleton";

export function TableSkeleton({ label, rows = 5, columns = 4 }: { label: string; rows?: number; columns?: number }) {
  return (
    <div role="status" aria-label={label} aria-busy="true" className="overflow-hidden rounded-xl border border-surface-border bg-surface-overlay text-surface-text">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="space-y-0">
        {Array.from({ length: rows + 1 }, (_, row) => (
          <div key={row} className={`flex items-center gap-4 border-b border-surface-border px-4 py-5 last:border-0 ${row === 0 ? "bg-surface-control" : ""}`}>
            {Array.from({ length: columns }, (_, column) => <Skeleton key={column} className={`h-4 min-w-0 ${column === 1 ? "flex-2" : "flex-1"}`} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
