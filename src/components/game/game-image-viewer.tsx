"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import FullscreenExitRoundedIcon from "@mui/icons-material/FullscreenExitRounded";
import SyncAltRoundedIcon from "@mui/icons-material/SyncAltRounded";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Button } from "@/components/ui/button";
import { MAP_CONFIG } from "@/core/constants/game";

const GameMap = dynamic(
  () => import("@/components/game/game-map").then((mod) => mod.GameMap),
  { ssr: false },
);

type GameImageViewerProps = {
  imageSrc: string;
  imageAlt: string;
  markerPosition: { lat: number; lng: number } | null;
  onMapClick: (lat: number, lng: number) => void;
  onSubmit?: () => void;
  isSubmitDisabled?: boolean;
};

const iconButtonSx = {
  backgroundColor: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(8px)",
  color: "#1b120c",
  width: 36,
  height: 36,
  "&:hover": {
    backgroundColor: "#fff",
    color: "var(--color-primary-main)",
  },
} as const;

const swapButtonSx = {
  ...iconButtonSx,
  width: 28,
  height: 28,
} as const;

export function GameImageViewer({
  imageSrc,
  imageAlt,
  markerPosition,
  onMapClick,
  onSubmit,
  isSubmitDisabled = false,
}: GameImageViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);

  const mainContent = isSwapped ? "map" : "image";
  const miniContent = isSwapped ? "image" : "map";

  const handleSwap = useCallback(() => setIsSwapped((prev) => !prev), []);

  return (
    <>
      <div className="relative w-full">
        <div className="relative aspect-4/3 w-full max-h-[78svh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
          {mainContent === "image" ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              sizes="(min-width: 64rem) 75vw, 95vw"
              className="object-cover"
            />
          ) : (
            <GameMap
              latitude={MAP_CONFIG.center.lat}
              longitude={MAP_CONFIG.center.lng}
              markerPosition={markerPosition}
              onMapClick={onMapClick}
            />
          )}

          {mainContent === "image" && (
            <div className="absolute top-3 right-3 z-10">
              <IconButton
                onClick={() => setIsFullscreen(true)}
                aria-label="เต็มจอ"
                size="small"
                sx={iconButtonSx}
              >
                <FullscreenRoundedIcon fontSize="small" />
              </IconButton>
            </div>
          )}
        </div>

        <div className="relative mt-3 flex w-full flex-col gap-2 sm:absolute sm:right-3 sm:bottom-3 sm:z-500 sm:mt-0 sm:w-64 md:w-72">
          <div className="relative h-40 w-full overflow-hidden rounded-xl border border-white/15 shadow-xl sm:h-44">
            {miniContent === "map" ? (
              <GameMap
                latitude={MAP_CONFIG.center.lat}
                longitude={MAP_CONFIG.center.lng}
                markerPosition={markerPosition}
                onMapClick={onMapClick}
              />
            ) : (
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(min-width: 768px) 18rem, (min-width: 640px) 16rem, 13rem"
                className="object-cover"
              />
            )}

            <div className="absolute top-2 right-2 z-1000">
              <IconButton
                onClick={handleSwap}
                aria-label="สลับตำแหน่ง"
                size="small"
                sx={swapButtonSx}
              >
                <SyncAltRoundedIcon
                  sx={{ fontSize: 16, transform: "rotate(45deg)" }}
                />
              </IconButton>
            </div>
          </div>

          {onSubmit && (
            <Button
              variant="primary"
              size="default"
              onClick={onSubmit}
              disabled={isSubmitDisabled}
              className="w-full shadow-lg"
            >
              <SendRoundedIcon fontSize="small" />
              ส่งคำตอบ
            </Button>
          )}
        </div>
      </div>

      <Dialog
        open={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        fullScreen
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "var(--color-secondary-main)",
            },
          },
        }}
      >
        <div className="relative flex h-full w-full items-center justify-center p-3">
          <div className="relative aspect-4/3 w-full max-w-[min(72rem,125svh)] overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />

            <div className="absolute top-3 right-3 z-10">
              <IconButton
                onClick={() => setIsFullscreen(false)}
                aria-label="ออกจากเต็มจอ"
                size="small"
                sx={iconButtonSx}
              >
                <FullscreenExitRoundedIcon fontSize="small" />
              </IconButton>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
