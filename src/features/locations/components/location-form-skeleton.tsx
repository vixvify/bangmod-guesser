import { Skeleton } from "@/shared/components/ui/skeleton";
import { LOCATION_MAX_IMAGES } from "../location.constants";

export default function LocationFormSkeleton() {
  return (
    <div
      role="status"
      aria-label="กำลังโหลดฟอร์มสถานที่"
      aria-busy="true"
      className="mx-auto w-full max-w-6xl"
    >
      <Skeleton className="h-5 w-40" />
      <div className="mt-3 mb-7 space-y-2">
        <Skeleton className="h-9 w-48 sm:h-10" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <div className="grid gap-8 border-t border-surface-border py-8 lg:grid-cols-2 lg:gap-10">
        <div>
          <Skeleton className="mb-5 h-7 w-32" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-28 w-full" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((key) => (
                <div key={key} className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-4 w-52 max-w-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-5 w-14" />
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="mt-5 mb-2 h-5 w-28" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: LOCATION_MAX_IMAGES }, (_, index) => (
              <Skeleton key={index} className="aspect-[4/3] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-surface-border pt-5">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
