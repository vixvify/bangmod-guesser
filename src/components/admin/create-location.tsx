"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LocationForm } from "@/components/admin/location-form";
import { LOCATION_MESSAGES } from "@/core/constants/location";
import type { Location } from "@/core/domain/location";
import type { CreateLocationFormImagesInput } from "@/core/schema/image.schema";
import type { CreateLocationInput } from "@/core/schema/location.schema";
import httpClient from "@/lib/http";
import { LocationRoutes } from "@/routes/api/location.routes";
import { AppRoutes } from "@/routes/app/routes";

export function CreateLocation({ header }: { header: ReactNode }) {
  const router = useRouter();

  async function saveLocation(
    values: CreateLocationInput,
    images: CreateLocationFormImagesInput,
  ) {
    const form = new FormData();
    form.append("name", values.name);
    form.append("description", values.description ?? "");
    form.append("latitude", String(values.latitude));
    form.append("longitude", String(values.longitude));
    images.images.forEach((image) => form.append("images", image));

    try {
      await httpClient.post<Location>(LocationRoutes.create, form, {
        headers: { "Content-Type": undefined },
      });
      toast.success(LOCATION_MESSAGES.createSuccess);
      router.push(AppRoutes.adminLocations);
    } catch {
      toast.error(LOCATION_MESSAGES.createFailed);
    }
  }

  return <LocationForm header={header} onSave={saveLocation} />;
}
