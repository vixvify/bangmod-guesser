"use client";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { mockLocations } from "@/_mock/_locations";
import { LocationForm } from "@/components/admin/location-form";
import type { UpdateLocationFormImagesInput } from "@/core/schema/image.schema";
import type { UpdateLocationFormInput } from "@/core/schema/location.schema";
import { AppRoutes } from "@/routes/app/routes";

export default function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const location = mockLocations.find((item) => item.id === id);
  if (!location) notFound();

  function saveLocation(values: UpdateLocationFormInput, images: UpdateLocationFormImagesInput) {
    console.log("Mock location update:", {
      id,
      ...values,
      ...images,
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
          แก้ไขสถานที่
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          แก้ไขข้อมูล พิกัด และรูปภาพของสถานที่สำหรับใช้ในเกม
        </p>
      </header>
      <LocationForm key={location.id} location={location} onSave={saveLocation} />
    </div>
  );
}
