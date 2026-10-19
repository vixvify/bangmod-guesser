export default function Loading() {
  return (
    <main
      className="flex min-h-svh items-center justify-center bg-secondary-main"
      aria-busy="true"
    >
      <h1 className="sr-only">กำลังโหลดหน้า</h1>
      <div role="status" aria-live="polite">
        <span
          aria-hidden="true"
          className="block size-12 animate-spin rounded-full border-4 border-secondary-light/15 border-t-primary-main motion-reduce:animate-none"
        />
        <span className="sr-only">กำลังโหลด...</span>
      </div>
    </main>
  );
}
