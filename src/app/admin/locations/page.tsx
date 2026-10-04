import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Link from "next/link";
import { LocationsList } from "@/components/admin/locations-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchLocationQuerySchema } from "@/core/schema/location.schema";
import { locationService } from "@/infrastructure/container";
import { parseSchema } from "@/lib/validation";
import { AppRoutes } from "@/routes/app/routes";

type ManageLocationProps = {
  searchParams: Promise<{ search?: string; page?: string }>;
};

export default async function LocationsPage({
  searchParams,
}: ManageLocationProps) {
  const filters = parseSchema(SearchLocationQuerySchema, await searchParams);
  const locations = await locationService.getLocations(filters);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Link
        href={AppRoutes.admin}
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-primary-main"
      >
        <ArrowBackRoundedIcon fontSize="small" />
        กลับไปภาพรวมระบบ
      </Link>
      <div className="mt-3 mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            จัดการสถานที่
          </h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            จัดการข้อมูลและรูปภาพของสถานที่ที่ใช้ภายในเกม
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end xl:w-auto">
          <form
            action={AppRoutes.adminLocations}
            className="flex w-full min-w-0 items-end gap-2 sm:flex-1 xl:w-96 xl:flex-none"
          >
            <div className="min-w-0 flex-1">
              <Input
                key={filters.search ?? ""}
                id="location-search"
                name="search"
                label="ค้นหาสถานที่"
                placeholder="เช่น CB2, หอสมุด"
                defaultValue={filters.search ?? ""}
                icon={<SearchRoundedIcon fontSize="small" />}
                size="small"
              />
            </div>
            <Button type="submit" variant="surface" size="small" className="shrink-0">
              ค้นหา
            </Button>
          </form>
          <Button
            href={AppRoutes.adminLocationCreate}
            variant="primary"
            size="small"
            className="w-full shrink-0 sm:w-auto"
          >
            <AddRoundedIcon fontSize="small" />
            สร้างสถานที่
          </Button>
        </div>
      </div>
      <LocationsList locations={locations} search={filters.search ?? ""} />
    </div>
  );
}
