"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SETTINGS, type GameSettings } from "@/features/settings/constants/settings";
import { GameSettingsSchema } from "@/features/settings/schema/settings.schema";

type SettingsStore = GameSettings & {
  setSettings: (settings: GameSettings) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setSettings: (settings) => set(GameSettingsSchema.parse(settings)),
    }),
    {
      name: "bangmod-guesser:settings",
      skipHydration: true,
      partialize: ({ imageQuality, systemSound, musicSound }) => ({
        imageQuality,
        systemSound,
        musicSound,
      }),
      merge: (persisted, current) => {
        const parsed = GameSettingsSchema.safeParse(persisted);
        return parsed.success ? { ...current, ...parsed.data } : current;
      },
    },
  ),
);
