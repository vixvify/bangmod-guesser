// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "@/core/constants/settings";
import { useSettingsStore } from "@/store/settings-store";

describe("settingsStore", () => {
  afterEach(() => {
    useSettingsStore.getState().setSettings(DEFAULT_SETTINGS);
    useSettingsStore.persist.clearStorage();
    localStorage.clear();
  });

  it("starts with the default image quality and sound levels", () => {
    expect(useSettingsStore.getState()).toMatchObject(DEFAULT_SETTINGS);
  });

  it("notifies subscribers when settings are saved and stops after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = useSettingsStore.subscribe(listener);
    const nextSettings = {
      imageQuality: "medium" as const,
      systemSound: 35,
      musicSound: 65,
    };

    useSettingsStore.getState().setSettings(nextSettings);
    expect(useSettingsStore.getState()).toMatchObject(nextSettings);
    expect(listener).toHaveBeenCalledOnce();

    unsubscribe();
    useSettingsStore.getState().setSettings(DEFAULT_SETTINGS);
    expect(listener).toHaveBeenCalledOnce();
  });

  it("restores saved settings from localStorage after a reload", async () => {
    const saved = { imageQuality: "low" as const, systemSound: 27, musicSound: 64 };
    useSettingsStore.getState().setSettings(saved);

    vi.resetModules();
    const { useSettingsStore: reloadedStore } = await import("@/store/settings-store");
    await reloadedStore.persist.rehydrate();

    expect(reloadedStore.getState()).toMatchObject(saved);
  });

  it("ignores invalid persisted settings", async () => {
    localStorage.setItem(
      "bangmod-guesser:settings",
      JSON.stringify({ state: { imageQuality: "invalid", systemSound: 200, musicSound: 50 }, version: 0 }),
    );

    vi.resetModules();
    const { useSettingsStore: reloadedStore } = await import("@/store/settings-store");
    await reloadedStore.persist.rehydrate();

    expect(reloadedStore.getState()).toMatchObject(DEFAULT_SETTINGS);
  });
});
