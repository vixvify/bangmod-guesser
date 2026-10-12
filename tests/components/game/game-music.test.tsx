// @vitest-environment jsdom

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useGameMusic } from "@/hooks/use-game-music";
import { useSettingsStore } from "@/store/settings-store";
import { DEFAULT_SETTINGS } from "@/core/constants/settings";
import { mockAudio } from "../../mocks/audio.mock";

function GameMusicHarness() {
  useGameMusic();
  return null;
}

afterEach(() => {
  cleanup();
  useSettingsStore.getState().setSettings(DEFAULT_SETTINGS);
  useSettingsStore.persist.clearStorage();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("game music", () => {
  it("plays only while the game component is mounted and follows music volume", async () => {
    const { audio, play, pause, load } = mockAudio();
    const { unmount } = render(<GameMusicHarness />);

    await waitFor(() => expect(play).toHaveBeenCalledOnce());
    expect(audio.getAttribute("src")).toBe("/audio/game.mp3");
    expect(audio.loop).toBe(true);
    expect(audio.volume).toBe(0.5);

    useSettingsStore.getState().setSettings({
      imageQuality: "ultra",
      systemSound: 80,
      musicSound: 30,
    });
    expect(audio.volume).toBe(0.3);

    unmount();
    expect(pause).toHaveBeenCalledOnce();
    expect(load).toHaveBeenCalledOnce();
    expect(audio.hasAttribute("src")).toBe(false);
  });

  it("retries blocked autoplay on a user interaction", async () => {
    const { play } = mockAudio();
    play.mockRejectedValueOnce(new DOMException("Blocked", "NotAllowedError"));
    render(<GameMusicHarness />);

    await waitFor(() => expect(play).toHaveBeenCalledOnce());
    fireEvent.pointerDown(window);
    await waitFor(() => expect(play).toHaveBeenCalledTimes(2));
    fireEvent.pointerDown(window);
    expect(play).toHaveBeenCalledTimes(2);
  });
});
