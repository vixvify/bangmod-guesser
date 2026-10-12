import { useSettingsStore } from "@/store/settings-store";

export type SoundEffect = "click" | "accept";

const soundSources: Record<SoundEffect, string> = {
  click: "/audio/click.MP3",
  accept: "/audio/accept.MP3",
};

const players = new Map<SoundEffect, HTMLAudioElement>();

export function playSoundEffect(sound: SoundEffect) {
  if (typeof Audio === "undefined") return;

  try {
    let player = players.get(sound);
    if (!player) {
      player = new Audio(soundSources[sound]);
      players.set(sound, player);
    }

    player.volume = useSettingsStore.getState().systemSound / 100;
    player.currentTime = 0;
    void player.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "NotAllowedError") return;
      console.warn("Unable to play sound effect", error);
    });
  } catch (error) {
    console.warn("Unable to play sound effect", error);
  }
}
