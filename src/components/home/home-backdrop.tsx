import { LobbyFx } from "@/components/home/lobby-fx";
import { BackgroundSlideshow } from "@/components/home/slideshow";

export function HomeBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <BackgroundSlideshow />
      <div className="absolute inset-0 bg-secondary-main/25" />
      <div className="lobby-vignette absolute inset-0" />
      <LobbyFx />
    </div>
  );
}
