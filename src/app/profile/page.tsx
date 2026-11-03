import { ProfileCard } from "@/features/profile/components/profile-card";
import { ProfileHistory } from "@/features/profile/components/profile-history";
import { UserRole } from "@/features/users/domain/user";
import { ProfileQuerySchema } from "@/features/profile/schema/profile.schema";
import { leaderboardService } from "@/container";
import { MainLayout } from "@/shared/components/layout/main-layout";
import { requireAuth } from "@/features/auth/lib/auth-check";
import { hasRole } from "@/shared/lib/role-check";
import { parseSchema } from "@/shared/lib/validation";

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
