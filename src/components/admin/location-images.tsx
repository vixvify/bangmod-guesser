"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import IconButton from "@mui/material/IconButton";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { IMAGE_CONTENT_TYPES, IMAGE_MAX_SIZE_BYTES } from "@/core/constants/image";
import { LOCATION_MAX_IMAGES, LOCATION_MESSAGES } from "@/core/constants/location";
import type { LocationImage } from "@/core/domain/location";

export type LocationImageDraft = LocationImage & { file?: File };

type LocationImagesProps = {
  images: LocationImageDraft[];
  onChange: (images: LocationImageDraft[]) => void;
};

export function LocationImages({ images, onChange }: LocationImagesProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const objectUrls = useRef(new Set<string>());
  const nextId = useRef(0);
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
    const available = LOCATION_MAX_IMAGES - images.length;
    setError(
      valid.length !== selected.length
        ? LOCATION_MESSAGES.imageInvalid
        : valid.length > available
          ? LOCATION_MESSAGES.imageLimit
          : "",
    );

    const added = valid.slice(0, available).map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);
      nextId.current += 1;
      return { id: `upload-${nextId.current}`, name: file.name, url, file };
    });
    if (added.length > 0) onChange([...images, ...added]);
    if (fileInput.current) fileInput.current.value = "";
  }

  function removeImage(image: LocationImageDraft) {
    if (image.file) {
      URL.revokeObjectURL(image.url);
      objectUrls.current.delete(image.url);
    }
    onChange(images.filter((item) => item.id !== image.id));
    setError("");
  }

  const remaining = LOCATION_MAX_IMAGES - images.length;

  return (
    <section aria-labelledby="location-images-title" className="min-w-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="location-images-title" className="text-lg font-bold">รูปภาพสถานที่</h2>
        <span className="text-sm text-slate-500">{images.length} / {LOCATION_MAX_IMAGES} รูป</span>
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
        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-slate-300 bg-white p-5"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
      >
        <div className="flex items-center gap-3">
          <FileUploadOutlinedIcon className="text-slate-500" />
          <div>
            <p className="text-sm font-medium">ลากรูปมาวางที่นี่ หรือเลือกไฟล์</p>
            <p className="mt-1 text-xs text-slate-500">แนบรูปได้สูงสุด 5 รูป · JPG, PNG, WebP · ไม่เกิน 5 MB ต่อรูป</p>
          </div>
        </div>
        <Button type="button" variant="surface" size="small" disabled={remaining === 0} onClick={() => fileInput.current?.click()}>
          เลือกรูปภาพ
        </Button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-5 mb-2 text-sm font-semibold">ตัวอย่างรูปภาพ</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, index) => (
          <div key={image.id} className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <Image src={image.url} alt={`รูปสถานที่ ${index + 1}`} fill sizes="(max-width: 640px) 45vw, 14rem" className="object-cover" unoptimized />
              <IconButton
                aria-label={`ลบรูป ${image.name}`}
                onClick={() => removeImage(image)}
                size="small"
                sx={{ position: "absolute", top: "0.375rem", right: "0.375rem", bgcolor: "#fff", "&:hover": { bgcolor: "#fee2e2" } }}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </div>
            <p className="mt-1 truncate text-xs text-slate-500" title={image.name}>{image.name}</p>
          </div>
        ))}
        {Array.from({ length: remaining }, (_, index) => (
          <button
            key={`empty-${index}`}
            type="button"
            aria-label={`เพิ่มรูปภาพช่องที่ ${images.length + index + 1}`}
            onClick={() => fileInput.current?.click()}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-500 transition-colors hover:border-primary-main hover:text-primary-main"
          >
            <AddRoundedIcon />
            เพิ่มรูปภาพ
          </button>
        ))}
      </div>
    </section>
  );
}
