import { vi } from "vitest";

export function mockAudio() {
  const audio = document.createElement("audio");
  const play = vi.spyOn(audio, "play").mockResolvedValue(undefined);
  const pause = vi.spyOn(audio, "pause").mockImplementation(() => undefined);
  const load = vi.spyOn(audio, "load").mockImplementation(() => undefined);
  vi.stubGlobal("Audio", vi.fn(function () { return audio; }));
  return { audio, play, pause, load };
}
