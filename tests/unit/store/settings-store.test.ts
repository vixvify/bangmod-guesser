// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "@/features/settings/settings.constants";
import { useSettingsStore } from "@/features/settings/settings.store";

describe("settingsStore", () => {
  afterEach(() => {
    useSettingsStore.getState().setSettings(DEFAULT_SETTINGS);
    useSettingsStore.persist.clearStorage();
    localStorage.clear();
  });

  it("starts with the default sound levels", () => {
    expect(useSettingsStore.getState()).toMatchObject(DEFAULT_SETTINGS);
  });

  it("notifies subscribers when settings are saved and stops after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = useSettingsStore.subscribe(listener);
    const nextSettings = {
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
    const saved = { systemSound: 27, musicSound: 64 };
    useSettingsStore.getState().setSettings(saved);

    vi.resetModules();
    const { useSettingsStore: reloadedStore } = await import("@/features/settings/settings.store");
    await reloadedStore.persist.rehydrate();

    expect(reloadedStore.getState()).toMatchObject(saved);
  });

  it("restores sound levels saved by older versions with image quality", async () => {
    localStorage.setItem("bangmod-guesser:settings", JSON.stringify({
      state: { imageQuality: "low", systemSound: 27, musicSound: 64 }, version: 0,
    }));
    vi.resetModules();
    const { useSettingsStore: reloadedStore } = await import("@/features/settings/settings.store");
    await reloadedStore.persist.rehydrate();
    expect(reloadedStore.getState()).toMatchObject({ systemSound: 27, musicSound: 64 });
    expect(reloadedStore.getState()).not.toHaveProperty("imageQuality");
  });

  it("ignores invalid persisted settings", async () => {
    localStorage.setItem(
      "bangmod-guesser:settings",
      JSON.stringify({ state: { imageQuality: "invalid", systemSound: 200, musicSound: 50 }, version: 0 }),
    );

    vi.resetModules();
    const { useSettingsStore: reloadedStore } = await import("@/features/settings/settings.store");
    await reloadedStore.persist.rehydrate();

    expect(reloadedStore.getState()).toMatchObject(DEFAULT_SETTINGS);
  });
});
