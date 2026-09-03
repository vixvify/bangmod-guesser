import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg">ไม่พบหน้าที่คุณกำลังค้นหา</p>
      <Link
        href="/"
        className="rounded-md bg-foreground px-4 py-2 text-background"
      >
        กลับหน้าหลัก
      </Link>
    </main>
  );
}
