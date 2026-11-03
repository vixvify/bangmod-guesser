"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LocationForm } from "@/features/locations/components/admin/location-form";
import { LOCATION_MESSAGES } from "@/features/locations/constants/location";
import type { Location } from "@/features/locations/domain/location";
import type { UpdateLocationFormImagesInput } from "@/features/images/schema/image.schema";
import type { UpdateLocationFormInput } from "@/features/locations/schema/location.schema";
import httpClient from "@/shared/lib/http";
import { LocationRoutes } from "@/features/locations/routes/location.routes";
import { AppRoutes } from "@/shared/routes/routes";

export function UpdateLocation({
  location,
  header,
}: {
  location: Location;
  header: ReactNode;
}) {
  const router = useRouter();

  async function saveLocation(
    values: UpdateLocationFormInput,
    images: UpdateLocationFormImagesInput,
  ) {
    const form = new FormData();
    form.append("name", values.name);
    form.append("description", values.description ?? "");
    form.append("latitude", String(values.latitude));
    form.append("longitude", String(values.longitude));
    if (images.keepImageNumbers.length === 0)
      form.append("keepImageNumbers", "");
    images.keepImageNumbers.forEach((number) =>
      form.append("keepImageNumbers", String(number)),
    );
    images.newImages.forEach((image) => form.append("newImages", image));

    try {
      await httpClient.put<Location>(LocationRoutes.update(location.id), form, {
        headers: { "Content-Type": undefined },
      });
      toast.success(LOCATION_MESSAGES.updateSuccess);
      router.push(AppRoutes.adminLocations);
    } catch {
      toast.error(LOCATION_MESSAGES.updateFailed);
    }
  }

  return <LocationForm location={location} header={header} onSave={saveLocation} />;
}
