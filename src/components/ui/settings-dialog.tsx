"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dropdown, type DropdownOption } from "@/components/ui/dropdown";
import {
  DEFAULT_SETTINGS,
  type GameSettings,
  type ImageQuality,
  SETTINGS_MESSAGES,
} from "@/core/constants/settings";

type SettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  initialSettings?: GameSettings;
  onSave?: (settings: GameSettings) => void;
};

const sliderStyles = {
  width: { xs: "9.5rem", sm: "12rem" },
  color: "#1b120c",
  height: 8,
  padding: "13px 0",
  "& .MuiSlider-rail": {
    backgroundColor: "#dcdfe4",
    opacity: 1,
    borderRadius: 4,
  },
  "& .MuiSlider-track": {
    backgroundColor: "#dcdfe4",
    border: "none",
    borderRadius: 4,
  },
  "& .MuiSlider-thumb": {
    width: 20,
    height: 20,
    backgroundColor: "#1b120c",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    "&:hover, &.Mui-focusVisible": {
      boxShadow: "0 0 0 8px rgba(27, 18, 12, 0.12)",
    },
    "&.Mui-active": {
      boxShadow: "0 0 0 12px rgba(27, 18, 12, 0.18)",
    },
  },
};

const qualityOptions: DropdownOption<ImageQuality>[] = [
  { value: "ultra", label: SETTINGS_MESSAGES.qualities.ultra },
  { value: "medium", label: SETTINGS_MESSAGES.qualities.medium },
  { value: "low", label: SETTINGS_MESSAGES.qualities.low },
];

export function SettingsDialog({
  open,
  onClose,
  initialSettings = DEFAULT_SETTINGS,
  onSave,
}: SettingsDialogProps) {
  const titleId = useId();
  const [settings, setSettings] = useState<GameSettings>(initialSettings);

  useEffect(() => {
    if (open) {
      setSettings(initialSettings);
    }
  }, [open, initialSettings]);

  const handleConfirm = () => {
    onSave?.(settings);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      slotProps={{
        paper: {
          sx: {
            width: "min(100%, 28rem)",
            borderRadius: "1.25rem",
            backgroundColor: "#ffffff",
            color: "var(--color-secondary-dark)",
            boxShadow:
              "0 1.25rem 2.5rem -0.5rem rgba(0, 0, 0, 0.25), 0 0.5rem 1rem -0.25rem rgba(0, 0, 0, 0.1)",
            padding: { xs: "1.25rem 1.5rem", sm: "1.75rem 2rem" },
            overflow: "hidden",
            margin: "1rem",
          },
        },
      }}
    >
      <div>
        <div className="flex items-center justify-between">
          <h2
            id={titleId}
            className="text-2xl font-bold tracking-tight text-secondary-dark"
          >
            {SETTINGS_MESSAGES.title}
          </h2>
          <IconButton
            type="button"
            onClick={onClose}
            aria-label={SETTINGS_MESSAGES.close}
            size="small"
            sx={{
              color: "var(--color-secondary-dark)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                color: "var(--color-primary-main)",
              },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </div>

        <div className="mt-3.5 mb-6 border-b border-neutral-200" />

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-secondary-dark sm:text-base">
              {SETTINGS_MESSAGES.sfxVolume}
            </span>
            <Slider
              value={settings.sfxVolume}
              onChange={(_, value) =>
                setSettings((prev) => ({
                  ...prev,
                  sfxVolume: value as number,
                }))
              }
              min={0}
              max={100}
              aria-label={SETTINGS_MESSAGES.sfxVolume}
              sx={sliderStyles}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-secondary-dark sm:text-base">
              {SETTINGS_MESSAGES.musicVolume}
            </span>
            <Slider
              value={settings.musicVolume}
              onChange={(_, value) =>
                setSettings((prev) => ({
                  ...prev,
                  musicVolume: value as number,
                }))
              }
              min={0}
              max={100}
              aria-label={SETTINGS_MESSAGES.musicVolume}
              sx={sliderStyles}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="image-quality-select"
              className="text-sm font-semibold text-secondary-dark sm:text-base"
            >
              {SETTINGS_MESSAGES.imageQuality}
            </label>
            <div className="w-40 sm:w-48">
              <Dropdown<ImageQuality>
                id="image-quality-select"
                value={settings.imageQuality}
                options={qualityOptions}
                onChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    imageQuality: value,
                  }))
                }
                aria-label={SETTINGS_MESSAGES.imageQuality}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 pt-2">
          <Button variant="surface" size="small" onClick={onClose}>
            {SETTINGS_MESSAGES.cancel}
          </Button>
          <Button variant="primary" size="small" onClick={handleConfirm}>
            {SETTINGS_MESSAGES.confirm}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
