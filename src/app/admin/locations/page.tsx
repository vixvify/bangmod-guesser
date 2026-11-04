import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "next/link";
import { LocationsList } from "@/features/locations/components/locations-list";
import { SearchLocationQuerySchema } from "@/features/locations/location.schema";
import { locationService } from "@/container";
import { parseSchema } from "@/shared/lib/validation";
import { AppRoutes } from "@/shared/routes/routes";

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
      <LocationsList
        key={`${filters.search ?? ""}:${filters.page}`}
        initialLocations={locations}
        initialSearch={filters.search ?? ""}
      />
    </div>
  );
}
