"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getErrorMessage } from "@/shared/lib/error-message";
import { LocationForm } from "@/features/locations/components/location-form";
import { LOCATION_MESSAGES } from "@/features/locations/location.constants";
import type { Location } from "@/features/locations/location";
import type { CreateLocationFormImagesInput } from "@/features/images/image.schema";
import type { CreateLocationInput } from "@/features/locations/location.schema";
import httpClient from "@/shared/lib/http";
import { LocationRoutes } from "@/features/locations/location.routes";
import { AppRoutes } from "@/shared/routes/routes";

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
    } catch (error) {
      toast.error(getErrorMessage(error, LOCATION_MESSAGES.createFailed));
    }
  }

  return <LocationForm header={header} onSave={saveLocation} />;
}
