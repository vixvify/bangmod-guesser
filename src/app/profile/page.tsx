import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileHistory } from "@/components/profile/profile-history";
import { UserRole } from "@/core/domain/user";
import { ProfileQuerySchema } from "@/core/schema/profile.schema";
import { leaderboardService } from "@/infrastructure/container";
import { MainLayout } from "@/layout/main-layout";
import { requireAuth } from "@/lib/auth-check";
import { hasRole } from "@/lib/role-check";
import { parseSchema } from "@/lib/validation";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}) {
  const user = await requireAuth();
  const query = parseSchema(ProfileQuerySchema, await searchParams);
  const profile = await leaderboardService.getProfile(user.id, query);

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
      <ProfileHistory
        key={`${query.from ?? ""}:${query.to ?? ""}:${query.page}`}
        initialProfile={profile}
        initialQuery={query}
      />
    </MainLayout>
  );
}
