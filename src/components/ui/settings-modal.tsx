"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import { useEffect, useId, useState, type ComponentPropsWithRef } from "react";
import { Button } from "@/components/ui/button";
import { Dropdown, type DropdownOption } from "@/components/ui/dropdown";
import {
  type GameSettings,
  type ImageQuality,
  SETTINGS_MESSAGES,
} from "@/core/constants/settings";
import { useSettingsStore } from "@/store/settings-store";
import { playSoundEffect } from "@/lib/sound-effect";

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
  soundEnabled?: boolean;
};

const sliderStyles = {
  width: "100%",
  color: "var(--color-primary-main)",
  height: 8,
  padding: "13px 0",
  "& .MuiSlider-rail": {
    backgroundColor: "var(--color-surface-control-border)",
    opacity: 1,
    borderRadius: 4,
  },
  "& .MuiSlider-track": {
    backgroundColor: "var(--color-primary-main)",
    border: "none",
    borderRadius: 4,
  },
  "& .MuiSlider-thumb": {
    width: 20,
    height: 20,
    backgroundColor: "var(--color-primary-main)",
    boxShadow: "none",
    "&:hover, &.Mui-focusVisible, &.Mui-active": {
      boxShadow:
        "0 0 0 0.5rem color-mix(in srgb, var(--color-primary-main) 16%, transparent)",
    },
    "&::before": {
      display: "none",
    },
  },
};

const qualityOptions: DropdownOption<ImageQuality>[] = [
  { value: "ultra", label: SETTINGS_MESSAGES.qualities.ultra },
  { value: "medium", label: SETTINGS_MESSAGES.qualities.medium },
  { value: "low", label: SETTINGS_MESSAGES.qualities.low },
];

type VolumeControlProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function VolumeControl({ label, value, onChange }: VolumeControlProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-sm font-semibold text-surface-text sm:text-base">
        {label}
      </span>
      <div className="flex w-52 min-w-0 items-center gap-3 sm:w-60">
        <Slider
          value={value}
          onChange={(_, nextValue) => {
            if (typeof nextValue === "number") onChange(nextValue);
          }}
          min={1}
          max={100}
          aria-label={label}
          getAriaValueText={(currentValue) => `${currentValue}%`}
          sx={sliderStyles}
        />
        <output className="w-11 shrink-0 text-right text-sm font-semibold tabular-nums text-surface-text">
          {value}%
        </output>
      </div>
    </div>
  );
}

export function SettingsModal({ open, onClose, soundEnabled = true }: SettingsModalProps) {
  const titleId = useId();
  const savedSettings = useSettingsStore();
  const settingsKey = `${savedSettings.imageQuality}:${savedSettings.systemSound}:${savedSettings.musicSound}`;

  useEffect(() => {
    void useSettingsStore.persist.rehydrate();
  }, []);

  return (
    <Modal
      open={open}
      role="region"
      onClose={onClose}
      aria-labelledby={titleId}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <SettingsContent
        key={settingsKey}
        titleId={titleId}
        onClose={onClose}
        soundEnabled={soundEnabled}
        initialSettings={savedSettings}
      />
    </Modal>
  );
}

function SettingsContent({
  titleId,
  onClose,
  initialSettings,
  soundEnabled,
  ref,
  ...modalProps
}: {
  titleId: string;
  onClose: () => void;
  initialSettings: GameSettings;
  soundEnabled: boolean;
} & ComponentPropsWithRef<"div">) {
  const [settings, setSettings] = useState<GameSettings>(initialSettings);

  const handleConfirm = () => {
    useSettingsStore.getState().setSettings(settings);
    if (soundEnabled) playSoundEffect("accept");
    onClose();
  };

  return (
    <div
      {...modalProps}
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-surface-border bg-secondary-main px-6 py-5 text-surface-text shadow-2xl outline-none sm:px-8 sm:py-7"
    >
      <div className="flex items-center justify-between">
        <h2
          id={titleId}
          className="text-2xl font-bold tracking-tight text-surface-text"
        >
          {SETTINGS_MESSAGES.title}
        </h2>
        <IconButton
          type="button"
          onClick={() => {
            if (soundEnabled) playSoundEffect("click");
            onClose();
          }}
          aria-label={SETTINGS_MESSAGES.close}
          size="small"
          sx={{
            color: "var(--color-surface-text)",
            "&:hover": {
              backgroundColor: "var(--color-surface-control-hover)",
              color: "var(--color-primary-light)",
            },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </div>

      <div className="mt-3.5 mb-6 border-b border-surface-border" />

      <div className="space-y-6">
        <VolumeControl
          label={SETTINGS_MESSAGES.sfxVolume}
          value={settings.systemSound}
          onChange={(value) =>
            setSettings((prev) => ({ ...prev, systemSound: value }))
          }
        />

        <VolumeControl
          label={SETTINGS_MESSAGES.musicVolume}
          value={settings.musicSound}
          onChange={(value) =>
            setSettings((prev) => ({ ...prev, musicSound: value }))
          }
        />

        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="image-quality-select"
            className="text-sm font-semibold text-surface-text sm:text-base"
          >
            {SETTINGS_MESSAGES.imageQuality}
          </label>
          <div className="w-40 sm:w-48">
            <Dropdown<ImageQuality>
              id="image-quality-select"
              theme="dark"
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
        <Button sound={soundEnabled ? "click" : undefined} variant="outline" size="small" onClick={onClose}>
          {SETTINGS_MESSAGES.cancel}
        </Button>
        <Button variant="primary" size="small" onClick={handleConfirm}>
          {SETTINGS_MESSAGES.confirm}
        </Button>
      </div>
    </div>
  );
}
