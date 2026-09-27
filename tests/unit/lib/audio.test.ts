// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { createAudio } from "@/lib/audio";
import { mockAudio } from "../../mocks/audio.mock";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("createAudio", () => {
  it("waits for an explicit play call and configures looping background audio", async () => {
    const { audio, play, pause } = mockAudio();
    const onStateChange = vi.fn();
    const player = createAudio("/audio/home.mp3", { onStateChange });

    expect(audio.getAttribute("src")).toBe("/audio/home.mp3");
    expect(audio.loop).toBe(true);
    expect(audio.volume).toBe(0.25);
    expect(audio.preload).toBe("none");
    expect(play).not.toHaveBeenCalled();
    await player.play();
    expect(onStateChange.mock.calls).toEqual([["loading"], ["playing"]]);
    player.pause();
    expect(pause).toHaveBeenCalledOnce();
    expect(onStateChange).toHaveBeenLastCalledWith("paused");
    player.dispose();
  });

  it("reports blocked playback and permits a retry", async () => {
    const { play } = mockAudio();
    play.mockRejectedValueOnce(new DOMException("Blocked", "NotAllowedError"));
    const onStateChange = vi.fn();
    const player = createAudio("/audio/home.mp3", { onStateChange });

    await player.play();
    expect(onStateChange).toHaveBeenLastCalledWith("error");
    await player.play();
    expect(onStateChange).toHaveBeenLastCalledWith("playing");
    player.dispose();
  });

  it("reports a media loading error", () => {
    const { audio } = mockAudio();
    const onStateChange = vi.fn();
    const player = createAudio("/audio/missing.mp3", { onStateChange });
    audio.dispatchEvent(new Event("error"));
    expect(onStateChange).toHaveBeenLastCalledWith("error");
    player.dispose();
  });

  it("releases audio and ignores a pending play result after disposal", async () => {
    const { audio, play, pause, load } = mockAudio();
    const pending = Promise.withResolvers<void>();
    play.mockReturnValue(pending.promise);
    const onStateChange = vi.fn();
    const player = createAudio("/audio/home.mp3", { onStateChange });
    const playback = player.play();
    player.dispose();
    onStateChange.mockClear();
    pending.resolve();
    await playback;
    audio.dispatchEvent(new Event("playing"));
    expect(onStateChange).not.toHaveBeenCalled();
    expect(pause).toHaveBeenCalledOnce();
    expect(audio.hasAttribute("src")).toBe(false);
    expect(load).toHaveBeenCalledOnce();
    await player.play();
    expect(play).toHaveBeenCalledOnce();
  });
});
