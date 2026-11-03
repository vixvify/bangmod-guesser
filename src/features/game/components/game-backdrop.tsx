import styles from "./game-backdrop.module.css";

export function GameBackdrop() {
  return (
    <div aria-hidden="true" data-game-backdrop className={styles.backdrop}>
      <div className={styles.grid} />
      <div className={styles.halo} />
      <div className={`${styles.signal} ${styles.signalLeft}`} />
      <div className={`${styles.signal} ${styles.signalRight}`} />
      <div className={styles.pixels} />
    </div>
  );
}
