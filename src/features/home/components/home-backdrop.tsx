import { LobbyFx } from "@/features/home/components/lobby-fx";
import { BackgroundSlideshow } from "@/features/home/components/slideshow";
import styles from "./home-backdrop.module.css";

export function HomeBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <BackgroundSlideshow />
      <div className="absolute inset-0 bg-secondary-main/25" />
      <div data-home-vignette className={`${styles.vignette} absolute inset-0`} />
      <LobbyFx />
    </div>
  );
}
