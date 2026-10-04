"use client";

import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LocationsTable } from "@/components/admin/locations-table";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ListPagination } from "@/components/ui/list-pagination";
import { LOCATION_MESSAGES } from "@/core/constants/location";
import type { Location, PaginatedLocations } from "@/core/domain/location";
import httpClient from "@/lib/http";
import { LocationRoutes } from "@/routes/api/location.routes";
import { AppRoutes } from "@/routes/app/routes";

export function LocationsList({ locations, search }: { locations: PaginatedLocations; search: string }) {
  const router = useRouter();
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);
  const [deleting, setDeleting] = useState(false);

  function goToPage(page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    router.push(`${AppRoutes.adminLocations}?${params}`);
  }

  async function deleteLocation() {
    if (!deletingLocation || deleting) return;
    setDeleting(true);
    try {
      await httpClient.delete<null>(LocationRoutes.delete(deletingLocation.id));
      toast.success(LOCATION_MESSAGES.deleteSuccess);
      setDeletingLocation(null);
      if (locations.page > 1 && locations.items.length === 1) {
        goToPage(locations.page - 1);
      } else {
        router.refresh();
      }
    } catch {
      toast.error(LOCATION_MESSAGES.deleteFailed);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {locations.items.length === 0 ? (
        <EmptyState
          title={LOCATION_MESSAGES.empty}
          description={search ? LOCATION_MESSAGES.emptySearchDescription : LOCATION_MESSAGES.emptyDescription}
          icon={<PlaceOutlinedIcon fontSize="large" />}
          action={search ? (
            <Button href={AppRoutes.adminLocations} variant="surface" size="small">
              {LOCATION_MESSAGES.clearSearch}
            </Button>
          ) : undefined}
        />
      ) : (
        <>
          <LocationsTable locations={locations.items} onDelete={setDeletingLocation} />
          <ListPagination
            totalItems={locations.total}
            pageSize={locations.pageSize}
            page={locations.page}
            itemLabel="สถานที่"
            onPageChange={goToPage}
          />
        </>
      )}
      <ConfirmModal
        open={Boolean(deletingLocation)}
        title={LOCATION_MESSAGES.delete.title}
        description={LOCATION_MESSAGES.delete.description(deletingLocation?.name ?? "สถานที่")}
        cancelLabel={LOCATION_MESSAGES.delete.cancel}
        confirmLabel={LOCATION_MESSAGES.delete.confirm}
        busy={deleting}
        onCancel={() => setDeletingLocation(null)}
        onConfirm={deleteLocation}
      />
    </>
  );
}
