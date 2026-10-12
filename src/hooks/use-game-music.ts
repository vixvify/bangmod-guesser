"use client";

import { useEffect } from "react";
import { createAudio } from "@/lib/audio";
import { useSettingsStore } from "@/store/settings-store";

export function useGameMusic() {
  useEffect(() => {
    let isPlaying = false;
    let hasFailed = false;
    const player = createAudio("/audio/game.mp3", {
      volume: useSettingsStore.getState().musicSound / 100,
      onStateChange: (state) => {
        isPlaying = state === "playing";
        if (state === "error") hasFailed = true;
      },
    });
    const unsubscribe = useSettingsStore.subscribe(({ musicSound }) => {
      player.setVolume(musicSound / 100);
    });

    function retryAfterInteraction() {
      if (isPlaying || hasFailed) return;
      void player.play({ autoplay: true });
    }

    window.addEventListener("pointerdown", retryAfterInteraction);
    window.addEventListener("keydown", retryAfterInteraction);
    void player.play({ autoplay: true });

    return () => {
      window.removeEventListener("pointerdown", retryAfterInteraction);
      window.removeEventListener("keydown", retryAfterInteraction);
      unsubscribe();
      player.dispose();
    };
  }, []);
}
