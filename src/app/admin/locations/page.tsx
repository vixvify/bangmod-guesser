"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Link from "next/link";
import { useState } from "react";
import { mockLocations, mockLocationTotal } from "@/_mock/_locations";
import { LocationsTable } from "@/components/admin/locations-table";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { ListPagination } from "@/components/ui/list-pagination";
import { LOCATION_MESSAGES } from "@/core/constants/location";
import type { Location } from "@/core/domain/location";
import { AppRoutes } from "@/routes/app/routes";

export default function LocationsPage() {
  const [deletingLocation, setDeletingLocation] =
    useState<Location | null>(null);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Link
        href={AppRoutes.admin}
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-primary-main"
      >
        <ArrowBackRoundedIcon fontSize="small" />
        กลับไปภาพรวมระบบ
      </Link>
      <div className="mt-3 mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            จัดการสถานที่
          </h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            จัดการข้อมูลและรูปภาพของสถานที่ที่ใช้ภายในเกม
          </p>
        </div>
        <div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
          <div className="min-w-52 flex-1 sm:w-72">
            <Input
              id="location-search"
              label="ค้นหาสถานที่"
              placeholder="เช่น ตึกวิศวะ 4, หอสมุด, CB2"
              icon={<SearchRoundedIcon fontSize="small" />}
              size="small"
            />
          </div>
          <Button
            href={AppRoutes.adminLocationCreate}
            variant="primary"
            size="small"
          >
            <AddRoundedIcon fontSize="small" />
            สร้างสถานที่
          </Button>
        </div>
      </div>

      <LocationsTable
        locations={mockLocations}
        onDelete={setDeletingLocation}
      />
      <ListPagination
        totalItems={mockLocationTotal}
        pageSize={mockLocations.length}
        page={1}
        itemLabel="สถานที่"
      />

      <ConfirmModal
        open={Boolean(deletingLocation)}
        title={LOCATION_MESSAGES.delete.title}
        description={LOCATION_MESSAGES.delete.description(
          deletingLocation?.name ?? "สถานที่",
        )}
        cancelLabel={LOCATION_MESSAGES.delete.cancel}
        confirmLabel={LOCATION_MESSAGES.delete.confirm}
        onCancel={() => setDeletingLocation(null)}
        onConfirm={() => {
          console.log("Mock location delete:", deletingLocation?.id);
          setDeletingLocation(null);
        }}
      />
    </div>
  );
}
