import { ProfileCard } from "@/features/profile/components/profile-card";
import { ProfileHistory } from "@/features/profile/components/profile-history";
import { UserRole, type User } from "@/features/users/user";
import type { ProfileResult } from "@/features/profile/profile";
import type { ProfileQueryInput } from "@/features/profile/profile.schema";
import type { LeaderboardEntry } from "@/features/leaderboard/leaderboard";
import { MainLayout } from "@/shared/components/layout/main-layout";
import { hasRole } from "@/shared/lib/role-check";

type ProfileViewProps = {
  viewer: User;
  profile: ProfileResult;
  query: ProfileQueryInput;
  isOwner: boolean;
  targetUserId?: string;
  stats?: LeaderboardEntry | null;
};

export function ProfileView({
  viewer,
  profile,
  query,
  isOwner,
  targetUserId,
  stats,
}: ProfileViewProps) {
  return (
    <MainLayout
      user={viewer}
      variant="contained"
      brandColor="var(--color-surface-text)"
      className="player-page-background relative min-h-svh bg-secondary-main text-surface-text"
    >
      <ProfileCard
        profile={
          isOwner
            ? viewer
            : {
                name: profile.name,
                email: profile.email,
                image: profile.image,
              }
        }
        isOwner={isOwner}
        stats={stats}
        canManageSystem={isOwner && hasRole(viewer, [UserRole.ADMIN])}
      />
      <ProfileHistory
        key={`${targetUserId ?? "me"}:${query.from ?? ""}:${query.to ?? ""}:${query.page}`}
        initialProfile={profile}
        initialQuery={query}
        userId={isOwner ? undefined : targetUserId}
      />
    </MainLayout>
  );
}
