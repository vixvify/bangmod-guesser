import type { Prisma } from "@prisma/client";

export const gameStateSelect = {
  id: true,
  userId: true,
  status: true,
  finishedAt: true,
} satisfies Prisma.GameSelect;

export type GameStateRecord = Prisma.GameGetPayload<{ select: typeof gameStateSelect }>;

export const gamePlayInclude = {
  rounds: {
    orderBy: { questionNumber: "asc" },
    include: { location: true, locationImage: true },
  },
} satisfies Prisma.GameInclude;

export type GamePlayRecord = Prisma.GameGetPayload<{ include: typeof gamePlayInclude }>;

export const gameCandidateSelect = {
  id: true,
  images: { select: { imageNumber: true } },
} satisfies Prisma.LocationSelect;

export type GameCandidateRecord = Prisma.LocationGetPayload<{ select: typeof gameCandidateSelect }>;
