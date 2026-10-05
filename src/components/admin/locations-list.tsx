"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { LocationsTable } from "@/components/admin/locations-table";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ListPagination } from "@/components/ui/list-pagination";
import { LOCATION_MESSAGES } from "@/core/constants/location";
import type { Location, PaginatedLocations } from "@/core/domain/location";
import { useDebounce } from "@/hooks/use-debounce";
import httpClient from "@/lib/http";
import { LocationRoutes } from "@/routes/api/location.routes";
import { AppRoutes } from "@/routes/app/routes";

export function LocationsList({
  initialLocations,
  initialSearch,
}: {
  initialLocations: PaginatedLocations;
  initialSearch: string;
}) {
  const router = useRouter();
  const [locations, setLocations] = useState(initialLocations);
  const [previousLocations, setPreviousLocations] = useState(initialLocations);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);
  const [deleting, setDeleting] = useState(false);
  const requestId = useRef(0);
  const debouncedSearch = useDebounce(searchInput, 200);
  const loading = debouncedSearch.trim() !== search;

  if (initialLocations !== previousLocations) {
    setPreviousLocations(initialLocations);
    setLocations(initialLocations);
    setSearch(initialSearch);
    setSearchInput(initialSearch);
  }

  useEffect(() => {
    if (searchInput !== debouncedSearch) return;
    const nextSearch = debouncedSearch.trim();
    if (nextSearch === search) return;

    const currentRequest = ++requestId.current;
    const params = new URLSearchParams();
    if (nextSearch) params.set("search", nextSearch);
    async function searchLocations() {
      try {
        const { data } = await httpClient.get<PaginatedLocations>(
          `${LocationRoutes.list}${params.size ? `?${params}` : ""}`,
        );
        if (currentRequest !== requestId.current) return;
        setLocations(data);
        setSearch(nextSearch);
        const path = `${AppRoutes.adminLocations}${params.size ? `?${params}` : ""}`;
        window.history.replaceState(window.history.state, "", path);
      } catch {
        if (currentRequest !== requestId.current) return;
        toast.error(LOCATION_MESSAGES.searchFailed);
        setSearchInput(search);
      }
    }

    void searchLocations();
    return () => { requestId.current += 1; };
  }, [debouncedSearch, initialLocations, search, searchInput]);

  function goToPage(page: number) {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    router.push(`${AppRoutes.adminLocations}?${params}`, { scroll: false });
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
      <div className="mt-3 mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">จัดการสถานที่</h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            จัดการข้อมูลและรูปภาพของสถานที่ที่ใช้ภายในเกม
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end xl:w-auto">
          <div className="w-full min-w-0 sm:flex-1 xl:w-96 xl:flex-none">
            <Input
              id="location-search"
              label="ค้นหาสถานที่"
              placeholder="เช่น CB2, หอสมุด"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              icon={<SearchRoundedIcon fontSize="small" />}
              size="small"
            />
          </div>
          <Button
            href={AppRoutes.adminLocationCreate}
            variant="primary"
            size="small"
            className="w-full shrink-0 sm:w-auto"
          >
            <AddRoundedIcon fontSize="small" />
            สร้างสถานที่
          </Button>
        </div>
      </div>
      {loading ? (
        <div role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          กำลังโหลดสถานที่...
        </div>
      ) : locations.items.length === 0 ? (
        <EmptyState
          title={LOCATION_MESSAGES.empty}
          description={search ? LOCATION_MESSAGES.emptySearchDescription : LOCATION_MESSAGES.emptyDescription}
          icon={<PlaceOutlinedIcon fontSize="large" />}
          action={search ? (
            <Button onClick={() => setSearchInput("")} variant="surface" size="small">
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
