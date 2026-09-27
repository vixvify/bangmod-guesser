export default function Loading() {
  return (
    <main
      className="flex min-h-svh items-center justify-center bg-secondary-main"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        aria-hidden="true"
        className="size-12 animate-spin rounded-full border-4 border-secondary-light/15 border-t-primary-main motion-reduce:animate-none"
      />
      <span className="sr-only">กำลังโหลด...</span>
    </main>
  );
}
