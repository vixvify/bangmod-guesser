"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { LocationImages } from "@/components/admin/location-images";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { LOCATION_MESSAGES } from "@/core/constants/location";
import type { Location } from "@/core/domain/location";
import type {
  CreateLocationFormImagesInput,
  UpdateLocationFormImagesInput,
} from "@/core/schema/image.schema";
import {
  CreateLocationSchema,
  type CreateLocationInput,
  type UpdateLocationFormInput,
} from "@/core/schema/location.schema";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { AppRoutes } from "@/routes/app/routes";

type LocationFormProps = { header?: ReactNode } & (
  | {
      location?: undefined;
      onSave: (
        values: CreateLocationInput,
        images: CreateLocationFormImagesInput,
      ) => void | Promise<void>;
    }
  | {
      location: Location;
      onSave: (
        values: UpdateLocationFormInput,
        images: UpdateLocationFormImagesInput,
      ) => void | Promise<void>;
    });

export function LocationForm(props: LocationFormProps) {
  const router = useRouter();
  const { location } = props;
  const isEdit = Boolean(location);
  const [existingImages, setExistingImages] = useState(location?.images ?? []);
  const [newImages, setNewImages] = useState<
    CreateLocationFormImagesInput["images"]
  >([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false);
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(CreateLocationSchema),
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

  const hasImages = existingImages.length + newImages.length > 0;
  const imagesDirty =
    newImages.length > 0 ||
    existingImages.length !== (location?.images.length ?? 0);
  const hasUnsavedChanges = isDirty || imagesDirty;
  const { cancelBrowserBack, confirmBrowserBack } = useUnsavedChangesGuard(
    hasUnsavedChanges,
    () => setDiscardConfirmationOpen(true),
  );
  const canSubmit =
    isValid && hasImages && !isSubmitting && (!isEdit || hasUnsavedChanges);
  const confirmation = isEdit
    ? LOCATION_MESSAGES.updateConfirm
    : LOCATION_MESSAGES.createConfirm;

  function onImagesChange(
    nextExistingImages: Location["images"],
    nextNewImages: CreateLocationFormImagesInput["images"],
  ) {
    setExistingImages(nextExistingImages);
    setNewImages(nextNewImages);
  }

  async function saveLocation(values: CreateLocationInput) {
    try {
      if (props.location) {
        await props.onSave(values, {
          keepImageNumbers: existingImages.map((image) => image.imageNumber),
          newImages,
        });
      } else {
        await props.onSave(values, { images: newImages });
      }
    } finally {
      setConfirmationOpen(false);
    }
  }

  function leaveLocationForm() {
    if (hasUnsavedChanges) {
      setDiscardConfirmationOpen(true);
    } else {
      router.push(AppRoutes.adminLocations);
    }
  }

  function confirmDiscard() {
    setDiscardConfirmationOpen(false);
    if (!confirmBrowserBack(() => router.push(AppRoutes.adminLocations))) {
      router.push(AppRoutes.adminLocations);
    }
  }

  return (
    <>
      {props.header && (
        <>
          <Link
            href={AppRoutes.adminLocations}
            className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-primary-main"
            onClick={(event) => {
              if (!hasUnsavedChanges) return;
              event.preventDefault();
              setDiscardConfirmationOpen(true);
            }}
          >
            <ArrowBackRoundedIcon fontSize="small" />
            กลับไปจัดการสถานที่
          </Link>
          {props.header}
        </>
      )}
      <form noValidate onSubmit={handleSubmit(() => setConfirmationOpen(true))}>
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
        <LocationImages
          existingImages={existingImages}
          newImages={newImages}
          onChange={onImagesChange}
        />
      </div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
        <Button
          type="button"
          variant="surface"
          size="small"
          onClick={leaveLocationForm}
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="small"
          disabled={!canSubmit}
        >
          {isSubmitting
            ? "กำลังบันทึก..."
            : isEdit
              ? "แก้ไขสถานที่"
              : "สร้างสถานที่"}
        </Button>
      </div>
      <ConfirmModal
        open={confirmationOpen}
        busy={isSubmitting}
        title={confirmation.title}
        description={confirmation.description}
        confirmLabel={confirmation.confirm}
        cancelLabel={confirmation.cancel}
        onConfirm={() => void handleSubmit(saveLocation)()}
        onCancel={() => setConfirmationOpen(false)}
      />
      <ConfirmModal
        open={discardConfirmationOpen}
        title={LOCATION_MESSAGES.discardConfirm.title}
        description={LOCATION_MESSAGES.discardConfirm.description}
        confirmLabel={LOCATION_MESSAGES.discardConfirm.confirm}
        cancelLabel={LOCATION_MESSAGES.discardConfirm.cancel}
        onConfirm={confirmDiscard}
        onCancel={() => {
          cancelBrowserBack();
          setDiscardConfirmationOpen(false);
        }}
      />
      </form>
    </>
  );
}
