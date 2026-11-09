import type { Prisma } from "@prisma/client";

export type LocationModelWithImages = Prisma.LocationGetPayload<{
  include: {
    images: true;
  };
}>;

export type GetLocationRecordsResult = {
  items: LocationModelWithImages[];
  total: number;
};

export type LocationUpdateResult =
  | { status: "UPDATED"; location: LocationModelWithImages }
  | { status: "IMAGE_IN_USE" }
  | { status: "STALE_UPDATE" };
