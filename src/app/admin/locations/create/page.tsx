import { CreateLocation } from "@/components/admin/create-location";

export default function CreateLocationPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <CreateLocation
        header={
          <header className="mt-3 mb-7">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              สร้างสถานที่
            </h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              เพิ่มข้อมูล พิกัด และรูปภาพของสถานที่สำหรับใช้ในเกม
            </p>
          </header>
        }
      />
    </div>
  );
}
