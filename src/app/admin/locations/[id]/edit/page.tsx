"use client";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { mockLocations } from "@/_mock/_locations";
import { LocationForm, type LocationFormValues } from "@/components/admin/location-form";
import { AppRoutes } from "@/routes/app/routes";

export default function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const location = mockLocations.find((item) => item.id === id);
  if (!location) notFound();

  function saveLocation(values: LocationFormValues) {
    console.log("Mock location update:", {
      id,
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
