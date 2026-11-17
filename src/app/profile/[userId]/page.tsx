import { notFound } from "next/navigation";
import { ProfileQuerySchema } from "@/features/profile/profile.schema";
import { profileService } from "@/container";
import { requireAuth } from "@/features/auth/server/auth-check";
import { parseSchema } from "@/shared/lib/validation";
import { AppError } from "@/shared/errors/app.error";
import { ProfileView } from "@/features/profile/components/profile-view";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}) {
  const user = await requireAuth();
  const { userId } = await params;
  const query = parseSchema(ProfileQuerySchema, await searchParams);
  const isOwner = user.id === userId;

  let profile;
  try {
    profile = isOwner
      ? await profileService.getProfile(user.id, query)
      : await profileService.getProfile(userId, query, user.id);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) {
      notFound();
      return null;
    }
    throw error;
  }

  return (
    <ProfileView
      viewer={user}
      profile={profile}
      query={query}
      isOwner={isOwner}
      targetUserId={userId}
    />
  );
}
