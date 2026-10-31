import type { Prisma } from "@prisma/client";

export const gameStateSelect = {
  id: true,
  userId: true,
  status: true,
  finishedAt: true,
} satisfies Prisma.GameSelect;

export type GameStateRecord = Prisma.GameGetPayload<{ select: typeof gameStateSelect }>;
