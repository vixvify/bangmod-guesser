"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  LocationImages,
  type LocationImageDraft,
} from "@/components/admin/location-images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Location } from "@/core/domain/location";
import {
  LocationFormSchema,
  type LocationFormInput,
} from "@/core/schema/location.schema";
import { AppRoutes } from "@/routes/app/routes";

type LocationFormProps = {
  location?: Location;
  onSave: (values: LocationFormValues) => void;
};

export type LocationFormValues = LocationFormInput & {
  keepImageNumbers: number[];
  newImages: File[];
};

export function LocationForm({ location, onSave }: LocationFormProps) {
  const isEdit = Boolean(location);
  const [images, setImages] = useState<LocationImageDraft[]>(
    location?.images ?? [],
  );
  const [imagesDirty, setImagesDirty] = useState(false);
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isDirty, isValid },
  } = useForm<LocationFormInput>({
    resolver: zodResolver(LocationFormSchema),
    mode: "onChange",
    defaultValues: {
      name: location?.name ?? "",
      description: location?.description ?? "",
      latitude: location ? String(location.latitude) : "",
      longitude: location ? String(location.longitude) : "",
    },
  });

  useEffect(() => {
    if (isEdit) void trigger();
  }, [isEdit, trigger]);

  function onImagesChange(nextImages: LocationImageDraft[]) {
    setImages(nextImages);
    setImagesDirty(true);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) =>
        onSave({
          ...values,
          keepImageNumbers: images.flatMap((image) =>
            "file" in image ? [] : [image.imageNumber],
          ),
          newImages: images.flatMap((image) =>
            "file" in image ? [image.file] : [],
          ),
        }),
      )}
    >
      <div className="grid gap-8 border-t border-slate-200 py-8 lg:grid-cols-2 lg:gap-10">
        <section aria-labelledby="location-info-title">
          <h2 id="location-info-title" className="mb-5 text-lg font-bold">
            ข้อมูลสถานที่
          </h2>
          <div className="flex flex-col gap-4">
            <Input
              id="location-name"
              label="ชื่อสถานที่ *"
              placeholder="เช่น อาคารเรียนรวม 2 (CB2)"
              size="small"
              {...register("name")}
              error={errors.name?.message}
              inputProps={{ maxLength: 100 }}
            />
            <Input
              id="location-description"
              label="คำอธิบาย"
              placeholder="อธิบายรายละเอียดหรือจุดสังเกตของสถานที่"
              size="small"
              multiline
              minRows={4}
              {...register("description")}
              error={errors.description?.message}
              inputProps={{ maxLength: 500 }}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="location-latitude"
                label="ละติจูด *"
                placeholder="เช่น 13.6516"
                size="small"
                inputMode="decimal"
                {...register("latitude")}
                error={errors.latitude?.message}
              />
              <Input
                id="location-longitude"
                label="ลองจิจูด *"
                placeholder="เช่น 100.4952"
                size="small"
                inputMode="decimal"
                {...register("longitude")}
                error={errors.longitude?.message}
              />
            </div>
            <p className="text-xs text-slate-500">
              ระบุพิกัดของสถานที่ในรูปแบบเลขทศนิยม
            </p>
          </div>
        </section>
        <LocationImages images={images} onChange={onImagesChange} />
      </div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
        <Button href={AppRoutes.adminLocations} variant="surface" size="small">
          ยกเลิก
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="small"
          disabled={!isValid || (isEdit && !isDirty && !imagesDirty)}
        >
          {isEdit ? "แก้ไขสถานที่" : "สร้างสถานที่"}
        </Button>
      </div>
    </form>
  );
}
