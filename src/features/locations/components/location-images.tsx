"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Tooltip from "@mui/material/Tooltip";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { IMAGE_CONTENT_TYPES, IMAGE_MAX_SIZE_BYTES } from "@/features/images/image.constants";
import { LOCATION_MAX_IMAGES, LOCATION_MESSAGES } from "@/features/locations/location.constants";
import type { Location } from "@/features/locations/location";
import type { CreateLocationFormImagesInput } from "@/features/images/image.schema";

type LocationImagesProps = {
  existingImages: Location["images"];
  newImages: CreateLocationFormImagesInput["images"];
  onChange: (
    existingImages: Location["images"],
    newImages: CreateLocationFormImagesInput["images"],
  ) => void;
};

export function LocationImages({
  existingImages,
  newImages,
  onChange,
}: LocationImagesProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [fullscreenKey, setFullscreenKey] = useState<string | null>(null);
  const previewTitleId = useId();
  const objectUrls = useRef(new Set<string>());
  const [previewUrls, setPreviewUrls] = useState(() => new Map<File, string>());
  const [error, setError] = useState("");

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  function addFiles(files: FileList | null) {
    if (!files) return;

    const selected = Array.from(files);
    const valid = selected.filter((file) =>
      IMAGE_CONTENT_TYPES.some((type) => type === file.type) &&
      file.size <= IMAGE_MAX_SIZE_BYTES,
    );
    const available =
      LOCATION_MAX_IMAGES - existingImages.length - newImages.length;
    setError(
      valid.length !== selected.length
        ? LOCATION_MESSAGES.imageInvalid
        : valid.length > available
          ? LOCATION_MESSAGES.imageLimit
          : "",
    );

    const added = valid.slice(0, available);
    const addedPreviews = new Map<File, string>();
    added.forEach((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);
      addedPreviews.set(file, url);
    });
    if (addedPreviews.size > 0) {
      setPreviewUrls((current) => new Map([...current, ...addedPreviews]));
    }
    if (added.length > 0) onChange(existingImages, [...newImages, ...added]);
    if (fileInput.current) fileInput.current.value = "";
  }

  function removeExistingImage(image: Location["images"][number]) {
    onChange(existingImages.filter((item) => item !== image), newImages);
    setError("");
  }

  function removeNewImage(file: File) {
    const url = previewUrls.get(file);
    if (url) {
      URL.revokeObjectURL(url);
      objectUrls.current.delete(url);
    }
    setPreviewUrls((current) => {
      const next = new Map(current);
      next.delete(file);
      return next;
    });
    onChange(existingImages, newImages.filter((item) => item !== file));
    setError("");
  }

  const previews = [
    ...existingImages.map((image) => ({
      key: `image-${image.imageNumber}`,
      label: `รูปที่ ${image.imageNumber}`,
      removeLabel: `ลบรูปที่ ${image.imageNumber}`,
      url: image.url,
      remove: () => removeExistingImage(image),
    })),
    ...newImages.flatMap((file) => {
      const url = previewUrls.get(file);
      return url
        ? [{ key: url, label: file.name, removeLabel: `ลบรูป ${file.name}`, url, remove: () => removeNewImage(file) }]
        : [];
    }),
  ];
  const imageCount = existingImages.length + newImages.length;
  const remaining = LOCATION_MAX_IMAGES - imageCount;
  const fullscreenImage = previews.find((image) => image.key === fullscreenKey);

  return (
    <section aria-labelledby="location-images-title" className="min-w-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="location-images-title" className="text-lg font-bold">รูปภาพสถานที่</h2>
        <span className="text-sm text-surface-muted">{imageCount} / {LOCATION_MAX_IMAGES} รูป</span>
      </div>
      <input
        ref={fileInput}
        type="file"
        multiple
        accept={IMAGE_CONTENT_TYPES.join(",")}
        aria-label="เลือกรูปภาพสถานที่"
        className="sr-only"
        onChange={(event) => addFiles(event.target.files)}
      />
      <div
        className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed p-5 motion-safe:transition-colors ${
          isDraggingFiles && remaining > 0
            ? "border-primary-main bg-primary-main/15"
            : "border-surface-border bg-surface-overlay"
        }`}
        onDragEnter={(event) => {
          if (!event.dataTransfer.types.includes("Files")) return;
          event.preventDefault();
          dragDepth.current += 1;
          setIsDraggingFiles(true);
        }}
        onDragLeave={() => {
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setIsDraggingFiles(false);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setIsDraggingFiles(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <div className="flex items-center gap-3">
          <FileUploadOutlinedIcon className="text-surface-muted" />
          <div>
            <p className="text-sm font-medium">ลากรูปมาวางที่นี่ หรือเลือกไฟล์</p>
            <p className="mt-1 text-xs text-surface-muted">แนบรูปได้สูงสุด 5 รูป · JPG, PNG, WebP · ไม่เกิน 5 MB ต่อรูป</p>
          </div>
        </div>
        <Button type="button" variant="outline" size="small" disabled={remaining === 0} onClick={() => fileInput.current?.click()}>
          เลือกรูปภาพ
        </Button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-5 mb-2 text-sm font-semibold">ตัวอย่างรูปภาพ</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {previews.map((image, index) => (
          <div key={image.key} className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-surface-border bg-surface-control">
              <Image src={image.url} alt={`รูปสถานที่ ${index + 1}`} fill sizes="(max-width: 640px) 45vw, 14rem" className="object-cover" unoptimized />
              <Tooltip title="ดูรูปเต็มจอ">
                <IconButton
                  aria-label={`ดูรูปเต็มจอ: ${image.label}`}
                  onClick={() => setFullscreenKey(image.key)}
                  size="small"
                  sx={{ position: "absolute", bottom: "0.375rem", right: "0.375rem", bgcolor: "var(--color-secondary-main)", color: "var(--color-surface-text)", "&:hover": { bgcolor: "var(--color-surface-control-hover)" } }}
                >
                  <FullscreenRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={image.removeLabel}>
                <IconButton
                  aria-label={image.removeLabel}
                  onClick={image.remove}
                  size="small"
                  sx={{ position: "absolute", top: "0.375rem", right: "0.375rem", bgcolor: "var(--color-secondary-main)", color: "var(--color-surface-text)", "&:hover": { bgcolor: "var(--color-surface-control-hover)" } }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
            <p className="mt-1 truncate text-xs text-surface-muted" title={image.label}>{image.label}</p>
          </div>
        ))}
        {Array.from({ length: remaining }, (_, index) => (
          <button
            key={`empty-${index}`}
            type="button"
            aria-label={`เพิ่มรูปภาพช่องที่ ${imageCount + index + 1}`}
            onClick={() => fileInput.current?.click()}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-surface-border bg-surface-overlay text-sm text-surface-muted transition-colors hover:border-primary-main hover:text-primary-main"
          >
            <AddRoundedIcon />
            เพิ่มรูปภาพ
          </button>
        ))}
      </div>
      <Modal
        open={Boolean(fullscreenImage)}
        onClose={() => setFullscreenKey(null)}
        aria-labelledby={previewTitleId}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={previewTitleId}
          tabIndex={-1}
          className="max-h-[calc(100dvh-2rem)] w-fit min-w-[min(100%,20rem)] max-w-full overflow-y-auto rounded-2xl border border-surface-border bg-secondary-main p-5 text-surface-text shadow-2xl outline-none sm:max-w-5xl sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id={previewTitleId} className="text-2xl font-bold">รูปภาพสถานที่</h2>
              <p className="mt-1 truncate text-sm text-surface-muted">{fullscreenImage?.label}</p>
            </div>
            <Tooltip title="ปิดรูปเต็มจอ">
              <IconButton color="inherit" size="small" onClick={() => setFullscreenKey(null)}>
                <CloseRoundedIcon />
              </IconButton>
            </Tooltip>
          </div>
          {fullscreenImage && (
            <Image
              src={fullscreenImage.url}
              alt={fullscreenImage.label}
              width={0}
              height={0}
              className="mx-auto mt-5 h-auto max-h-[70dvh] w-auto max-w-full rounded-xl object-contain"
              unoptimized
            />
          )}
        </div>
      </Modal>
    </section>
  );
}
