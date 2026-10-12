import { mockGameHistory } from "@/_mock/_profile";
import { GameHistory } from "@/components/profile/game-history";
import { ProfileCard } from "@/components/profile/profile-card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ListPagination } from "@/components/ui/list-pagination";
import { UserRole } from "@/core/domain/user";
import { MainLayout } from "@/layout/main-layout";
import { requireAuth } from "@/lib/auth-check";
import { hasRole } from "@/lib/role-check";

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <MainLayout
      user={user}
      variant="contained"
      brandColor="var(--color-surface-text)"
      className="relative min-h-svh bg-secondary-main text-surface-text"
    >
      <ProfileCard
        profile={user}
        canManageSystem={hasRole(user, [UserRole.ADMIN])}
      />
      <section
        aria-labelledby="game-history-title"
        className="mt-5 rounded-3xl border border-surface-border bg-surface-overlay p-4 shadow-2xl shadow-black/20 sm:p-6"
      >
          <div className="flex flex-col gap-5 rounded-2xl border border-surface-border bg-surface-overlay p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div>
            <h2 id="game-history-title" className="text-xl font-bold text-surface-text">
              ประวัติการเล่นเกม
            </h2>
            <p className="text-sm text-primary-light">Game History</p>
          </div>
          <DateRangePicker
            label="เลือกช่วงเวลา"
            defaultValue={{ startDate: "2026-09-02", endDate: "2026-09-04" }}
            theme="dark"
          />
        </div>
        <GameHistory games={mockGameHistory} />
        <ListPagination
          totalItems={mockGameHistory.length}
          pageSize={4}
          itemLabel="เกม"
          theme="dark"
        />
      </section>
    </MainLayout>
  );
}
