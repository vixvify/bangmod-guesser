export function LobbyEmblem() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto grid size-[clamp(5rem,13svh,8.5rem)] place-items-center"
    >
      <div className="absolute inset-0 rounded-full border border-primary-soft/20 motion-safe:animate-lobby-orbit">
        <span className="absolute left-1/2 top-0 size-2 -translate-y-1/2 rounded-full bg-primary-light shadow-[0_0_18px_var(--color-primary-main)]" />
      </div>
      <svg
        viewBox="0 0 160 160"
        className="size-full overflow-visible motion-safe:animate-lobby-float"
      >
        <circle
          cx="80"
          cy="80"
          r="57"
          fill="var(--color-secondary-main)"
          fillOpacity=".6"
          stroke="var(--color-primary-soft)"
          strokeOpacity=".4"
        />
        <circle
          cx="80"
          cy="80"
          r="49"
          fill="none"
          stroke="var(--color-primary-light)"
          strokeOpacity=".45"
          strokeDasharray="1 9"
        />
        <path
          d="M80 10v14m0 112v14M10 80h14m112 0h14"
          stroke="var(--color-primary-soft)"
          strokeWidth="2"
        />
        <path d="m80 18 5 11H75Z" fill="var(--color-primary-light)" />
        <path
          d="M80 40c-17 0-30 13-30 30 0 24 30 53 30 53s30-29 30-53c0-17-13-30-30-30Z"
          fill="var(--color-primary-main)"
          stroke="var(--color-primary-soft)"
          strokeWidth="2"
          className="drop-shadow-[0_8px_16px_var(--color-secondary-dark)]"
        />
        <circle cx="80" cy="70" r="12" fill="var(--color-secondary-light)" />
        <circle cx="80" cy="70" r="5" fill="var(--color-secondary-dark)" />
        <path
          d="m34 34 8 8m76 76 8 8m0-92-8 8m-76 76-8 8"
          stroke="var(--color-primary-light)"
          strokeOpacity=".6"
        />
      </svg>
    </div>
  );
}
