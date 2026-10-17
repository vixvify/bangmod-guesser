"use client";

import { useId } from "react";
import Image from "next/image";
import Modal from "@mui/material/Modal";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Button } from "@/components/ui/button";
import type { Location } from "@/core/domain/location";
import { GAME_RESULT_MESSAGES as MESSAGES } from "@/core/constants/game-result";

type LocationInfoModalProps = {
  location: Location;
  open: boolean;
  onClose: () => void;
};

export function LocationInfoModal({ location, open, onClose }: LocationInfoModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const image = location.images[0];

  return (
    <Modal open={open} onClose={onClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <section role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} tabIndex={-1} className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-surface-border bg-secondary-main p-5 text-surface-text shadow-2xl outline-none sm:p-8">
        <header className="flex items-start justify-between gap-4 border-b border-surface-border pb-5">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-primary-light">EXPLORE BANGMOD</p>
            <h2 id={titleId} className="text-2xl font-bold">{location.name}</h2>
          </div>
          <Button variant="outline" size="icon" sound="click" onClick={onClose} aria-label={MESSAGES.closeLocation}><CloseRoundedIcon /></Button>
        </header>
        {image && <div className="relative mt-6 aspect-video overflow-hidden rounded-xl"><Image src={image.url} alt={location.name} fill sizes="(min-width: 640px) 40rem, 90vw" className="object-cover" /></div>}
        <p id={descriptionId} className="mt-5 text-sm leading-7 text-surface-muted">{location.description || "ยังไม่มีรายละเอียดสถานที่"}</p>
      </section>
    </Modal>
  );
}
