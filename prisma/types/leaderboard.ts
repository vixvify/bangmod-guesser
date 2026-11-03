import type { Prisma } from "@prisma/client";

export const leaderboardUserSelect = {
  id: true,
  name: true,
  games: {
    where: {
      status: "COMPLETED",
      totalScore: { not: null },
    },
    select: {
      totalScore: true,
    },
  },
} satisfies Prisma.UserSelect;

export const profileGameSelect = {
  id: true,
  status: true,
  startedAt: true,
  totalScore: true,
  rounds: {
    orderBy: { questionNumber: "asc" },
    where: {
      guessedLatitude: { not: null },
      guessedLongitude: { not: null },
    },
    select: {
      questionNumber: true,
      guessedLatitude: true,
      guessedLongitude: true,
      score: true,
      location: {
        select: {
          latitude: true,
          longitude: true,
        },
      },
    },
  },
} satisfies Prisma.GameSelect;

export const profileUserSelect = {
  id: true,
  name: true,
  email: true,
  games: {
    select: profileGameSelect,
  },
} satisfies Prisma.UserSelect;

export type LeaderboardUserRecord = Prisma.UserGetPayload<{
  select: typeof leaderboardUserSelect;
}>;

export type LeaderboardGameRecord =
  LeaderboardUserRecord["games"][number];

export type ProfileUserRecord = Prisma.UserGetPayload<{
  select: typeof profileUserSelect;
}>;

export type ProfileGameRecord =
  ProfileUserRecord["games"][number];

export type ProfileRoundRecord =
  ProfileGameRecord["rounds"][number];

export type LeaderboardQueryRecord = {
  userId: string;
  rank: number;
  name: string;
  gamesPlayed: number;
  totalScore: number;
};
