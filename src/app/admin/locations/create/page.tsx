"use client";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "next/link";
import { LocationForm, type LocationFormValues } from "@/components/admin/location-form";
import { AppRoutes } from "@/routes/app/routes";

export default function CreateLocationPage() {
  function saveLocation(values: LocationFormValues) {
    console.log("Mock location create:", {
      id: undefined,
      ...values,
      images: values.images.map(({ id, name, file }) => ({
        id,
        name,
        file: file?.name,
      })),
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Link
        href={AppRoutes.adminLocations}
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-primary-main"
      >
        <ArrowBackRoundedIcon fontSize="small" />
        กลับไปจัดการสถานที่
      </Link>
      <header className="mt-3 mb-7">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          สร้างสถานที่
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          เพิ่มข้อมูล พิกัด และรูปภาพของสถานที่สำหรับใช้ในเกม
        </p>
      </header>
      <LocationForm onSave={saveLocation} />
    </div>
  );
}
