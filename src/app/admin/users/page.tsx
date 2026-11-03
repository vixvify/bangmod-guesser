import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "next/link";
import { UsersList } from "@/features/users/components/admin/users-list";
import { SearchUserQuerySchema } from "@/features/users/schema/user.schema";
import { userService } from "@/container";
import { parseSchema } from "@/shared/lib/validation";
import { AppRoutes } from "@/shared/routes/routes";

type UsersPageProps = {
  searchParams: Promise<{ page?: string; role?: string; status?: string }>;
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const filters = parseSchema(SearchUserQuerySchema, await searchParams);
  const users = await userService.getUsers(filters);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Link
        href={AppRoutes.admin}
        className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-primary-main"
      >
        <ArrowBackRoundedIcon fontSize="small" />
        กลับไปภาพรวมระบบ
      </Link>
      <UsersList
        key={`${filters.page}:${filters.role ?? ""}:${filters.status ?? ""}`}
        initialUsers={users}
        initialRole={filters.role ?? "ALL"}
        initialStatus={filters.status ?? "ALL"}
      />
    </div>
  );
}
