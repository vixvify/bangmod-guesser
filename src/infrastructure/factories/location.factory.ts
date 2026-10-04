import {
  LocationStatus,
  type Location,
  type PaginatedLocations,
} from "@/core/domain/location";
import type { LocationModelWithImages } from "../../../prisma/types/location";

export const LocationFactory = {
  toDomain(model: LocationModelWithImages): Location {
    return {
      id: model.id,
      name: model.name,
      description: model.description,
      latitude: model.latitude,
      longitude: model.longitude,
      status: model.status as LocationStatus,
      images: [...model.images]
        .sort((a, b) => a.imageNumber - b.imageNumber)
        .map((img) => ({
          imageNumber: img.imageNumber,
          url: img.imageUrl,
        })),
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  },

  toPaginatedDomain(
    models: LocationModelWithImages[],
    total: number,
    page: number,
    pageSize: number,
  ): PaginatedLocations {
    return {
      items: models.map((m) => LocationFactory.toDomain(m)),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },
};
