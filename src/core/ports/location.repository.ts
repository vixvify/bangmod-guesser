import type { LocationModelWithImages } from "../../../prisma/types/location";
import type { LocationStatus } from "../domain/location";

export interface CreateLocationRepositoryInput {
  name: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  status?: LocationStatus;
  images: Array<{
    imageNumber: number;
    imageUrl: string;
  }>;
}

export interface UpdateLocationRepositoryInput {
  name?: string;
  description?: string | null;
  latitude?: number;
  longitude?: number;
  status?: LocationStatus;
}

export interface FindLocationsQuery {
  search?: string;
  searchBy?: "name" | "description";
  skip: number;
  take: number;
  orderBy?: "asc" | "desc";
}

export interface LocationRepository {
  findMany(query: FindLocationsQuery): Promise<{
    items: LocationModelWithImages[];
    total: number;
  }>;
  findById(id: string): Promise<LocationModelWithImages | null>;
  create(data: CreateLocationRepositoryInput): Promise<LocationModelWithImages>;
  update(
    id: string,
    data: UpdateLocationRepositoryInput,
  ): Promise<LocationModelWithImages>;
  delete(id: string): Promise<void>;
  updateImage(
    locationId: string,
    imageNumber: number,
    imageUrl: string,
  ): Promise<void>;
  deleteImages(locationId: string, imageNumbers: number[]): Promise<void>;
  setLocationImages(
    locationId: string,
    images: Array<{
      imageNumber: number;
      imageUrl: string;
    }>,
  ): Promise<void>;
}
