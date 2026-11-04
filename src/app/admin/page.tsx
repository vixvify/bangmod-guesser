import { DashboardCharts } from "@/features/dashboard/components/dashboard-charts";
import { DashboardFilters } from "@/features/dashboard/components/dashboard-filters";
import { DashboardRecentGames } from "@/features/dashboard/components/dashboard-recent-games";
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { Button } from "@/shared/components/ui/button";
import { DashboardQuerySchema } from "@/features/dashboard/dashboard.schema";
import { dashboardService } from "@/container";
import { parseSchema } from "@/shared/lib/validation";
import { AppRoutes } from "@/shared/routes/routes";

type AdminPageProps = {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const query = parseSchema(DashboardQuerySchema, { pageSize: 5, ...await searchParams });
  const dashboard = await dashboardService.getDashboard(query);

  return (
    <div className="mx-auto w-full max-w-6xl pb-8">
      <header className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ภาพรวมระบบ
          </h1>
          <p className="mt-2 text-sm text-slate-500">ภาพรวมระบบและผลการเล่น</p>
        </div>
        <nav aria-label="จัดการระบบ" className="flex flex-wrap gap-2">
          <Button href={AppRoutes.adminUsers} variant="surface" size="small">
            จัดการผู้ใช้
          </Button>
          <Button
            href={AppRoutes.adminLocations}
            variant="surface"
            size="small"
          >
            จัดการสถานที่
          </Button>
        </nav>
      </header>
      <div className="mb-5 flex justify-start sm:justify-end">
        <DashboardFilters
          key={`${dashboard.period.startDate}:${dashboard.period.endDate}`}
          period={dashboard.period}
        />
      </div>
      <DashboardStats summary={dashboard} />
      <DashboardCharts
        dailyGames={dashboard.dailyGames}
        scores={dashboard.scores}
      />
      <DashboardRecentGames
        key={`${dashboard.period.startDate}:${dashboard.period.endDate}`}
        initialGames={dashboard.games}
        period={dashboard.period}
      />
    </div>
  );
}
