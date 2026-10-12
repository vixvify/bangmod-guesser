// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockAudio } from "../../mocks/audio.mock";

beforeEach(() => vi.resetModules());

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("playSoundEffect", () => {
  it("uses the selected sound and the saved system volume", async () => {
    const { audio, play } = mockAudio();
    const { useSettingsStore } = await import("@/store/settings-store");
    const { playSoundEffect } = await import("@/lib/sound-effect");
    useSettingsStore.getState().setSettings({
      imageQuality: "ultra",
      systemSound: 35,
      musicSound: 50,
    });

    playSoundEffect("click");
    expect(Audio).toHaveBeenCalledWith("/audio/click.MP3");
    expect(audio.volume).toBe(0.35);
    expect(play).toHaveBeenCalledOnce();

    useSettingsStore.getState().setSettings({
      imageQuality: "ultra",
      systemSound: 80,
      musicSound: 50,
    });
    audio.currentTime = 4;
    playSoundEffect("click");
    expect(Audio).toHaveBeenCalledOnce();
    expect(audio.volume).toBe(0.8);
    expect(audio.currentTime).toBe(0);
    expect(play).toHaveBeenCalledTimes(2);
  });

  it("plays the accept asset and does not break clicks if playback is blocked", async () => {
    const { play } = mockAudio();
    play.mockRejectedValueOnce(new DOMException("Blocked", "NotAllowedError"));
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { playSoundEffect } = await import("@/lib/sound-effect");

    expect(() => playSoundEffect("accept")).not.toThrow();
    expect(Audio).toHaveBeenCalledWith("/audio/accept.MP3");
    await Promise.resolve();
    expect(warning).not.toHaveBeenCalled();
  });
});
