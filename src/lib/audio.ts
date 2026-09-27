export type AudioState = "paused" | "loading" | "playing" | "error";

type AudioOptions = {
  loop?: boolean;
  volume?: number;
  onStateChange: (state: AudioState) => void;
};

export function createAudio(source: string, options: AudioOptions) {
  const audio = new Audio();
  const lifecycle = new AbortController();
  audio.preload = "none";
  audio.src = source;
  audio.loop = options.loop ?? true;
  audio.volume = Math.min(1, Math.max(0, options.volume ?? 0.25));

  function updateState(state: AudioState) {
    if (!lifecycle.signal.aborted) options.onStateChange(state);
  }

  audio.addEventListener("playing", () => updateState("playing"), { signal: lifecycle.signal });
  audio.addEventListener("pause", () => updateState("paused"), { signal: lifecycle.signal });
  audio.addEventListener("ended", () => updateState("paused"), { signal: lifecycle.signal });
  audio.addEventListener("error", () => updateState("error"), { signal: lifecycle.signal });

  return {
    async play({ autoplay = false } = {}) {
      if (lifecycle.signal.aborted) return;
      updateState("loading");
      try {
        await audio.play();
        updateState("playing");
      } catch (error) {
        const isAutoplayBlocked =
          autoplay && error instanceof DOMException && error.name === "NotAllowedError";
        updateState(isAutoplayBlocked ? "paused" : "error");
      }
    },
    pause() {
      if (lifecycle.signal.aborted) return;
      audio.pause();
      updateState("paused");
    },
    dispose() {
      if (lifecycle.signal.aborted) return;
      lifecycle.abort();
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    },
  };
}
