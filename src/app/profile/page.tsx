import { ProfileQuerySchema } from "@/features/profile/profile.schema";
import { profileService } from "@/container";
import { requireAuth } from "@/features/auth/server/auth-check";
import { parseSchema } from "@/shared/lib/validation";
import { ProfileView } from "@/features/profile/components/profile-view";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}) {
  const user = await requireAuth();
  const query = parseSchema(ProfileQuerySchema, await searchParams);
  const profile = await profileService.getProfile(user.id, query);

  return (
    <ProfileView
      viewer={user}
      profile={profile}
      query={query}
      isOwner={true}
    />
  );
}
