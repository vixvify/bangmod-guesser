export default function Loading() {
  return (
    <main
      className="relative flex min-h-svh items-center justify-center overflow-hidden bg-secondary-main px-6 py-12 text-secondary-light"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,122,47,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[auto,24px_24px]" />

      <section className="relative flex w-full max-w-xs flex-col items-center rounded-2xl border border-white/10 bg-secondary-main/75 px-7 py-10 text-center shadow-2xl shadow-black/30 backdrop-blur-sm">
        <div
          className="relative grid h-24 w-24 place-items-center"
          aria-hidden="true"
        >
          <span className="absolute inset-0 animate-loading-orbit rounded-full border border-primary-main/25 motion-reduce:animate-none" />
          <span className="absolute inset-3 animate-loading-orbit rounded-full border border-primary-main/45 [animation-delay:-900ms] motion-reduce:animate-none" />
          <span className="absolute h-12 w-12 animate-loading-pulse rounded-full bg-primary-main/15 motion-reduce:animate-none" />
          <svg
            viewBox="0 0 64 64"
            className="relative h-12 w-12 fill-primary-main drop-shadow-[0_0_18px_rgba(255,122,47,0.5)]"
          >
            <path d="M32 5a19 19 0 0 0-19 19c0 14 19 35 19 35s19-21 19-35A19 19 0 0 0 32 5Zm0 27a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
          </svg>
        </div>

        <p className="mt-7 font-display text-3xl uppercase tracking-[0.08em] text-white">
          Finding your spot
        </p>
        <p className="mt-2 text-sm text-secondary-light/55">
          กำลังเตรียมแผนที่บางมด...
        </p>

        <div
          className="mt-7 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
          aria-hidden="true"
        >
          <span className="block h-full w-2/5 animate-loading-scan rounded-full bg-primary-main motion-reduce:animate-none" />
        </div>
      </section>
    </main>
  );
}
