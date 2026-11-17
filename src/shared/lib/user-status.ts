export type UserStatus = "ACTIVE" | "SUSPENDED";

type UserBanInfo = {
  banned: boolean;
  banExpires: Date | null;
};

export function getUserStatus(
  user: UserBanInfo,
  now: Date = new Date(),
): UserStatus {
  if (!user.banned) return "ACTIVE";
  if (user.banExpires && user.banExpires <= now) {
    return "ACTIVE";
  }
  return "SUSPENDED";
}
