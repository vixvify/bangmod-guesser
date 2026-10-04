import { notFound } from "next/navigation";
import { UpdateLocation } from "@/components/admin/update-location";
import { AppError } from "@/core/errors/app.error";
import { LocationIdSchema } from "@/core/schema/location.schema";
import { locationService } from "@/infrastructure/container";
import { parseSchema } from "@/lib/validation";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const location = await (async () => {
    try {
      const id = parseSchema(LocationIdSchema, (await params).id);
      return await locationService.getLocationById(id);
    } catch (error) {
      if (
        error instanceof AppError &&
        (error.status === 400 || error.status === 404)
      ) {
        notFound();
      }
      throw error;
    }
  })();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <UpdateLocation
        location={location}
        header={
          <header className="mt-3 mb-7">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              แก้ไขสถานที่
            </h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              แก้ไขข้อมูล พิกัด และรูปภาพของสถานที่สำหรับใช้ในเกม
            </p>
          </header>
        }
      />
    </div>
  );
}
