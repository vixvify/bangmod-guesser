import type { Prisma } from "@prisma/client";

export type LocationModelWithImages = Prisma.LocationGetPayload<{
  include: {
    images: true;
  };
}>;
