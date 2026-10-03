import { AppError } from "../errors/app.error";
import { LOCATION_MAX_IMAGES } from "../constants/location";
import {
  LocationStatus,
  type Location,
  type PaginatedLocations,
} from "../domain/location";
import type { LocationRepository } from "../ports/location.repository";
import type {
  CreateLocationInput,
  SearchLocationQueryInput,
  UpdateLocationInput,
  UpdateLocationRecordInput,
} from "../schema/location.schema";
import type { ImageService } from "./image.service";
import { LocationFactory } from "@/infrastructure/factories/location.factory";
import { extractImageKey } from "@/lib/image-key";

export class LocationService {
  constructor(
    private readonly locationRepository: LocationRepository,
    private readonly imageService: ImageService,
  ) {}

  async getLocations(
    query: SearchLocationQueryInput,
  ): Promise<PaginatedLocations> {
    const { items, total } = await this.locationRepository.findMany({
      search: query.search,
      searchBy: query.searchBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: query.orderBy,
    });

    return LocationFactory.toPaginatedDomain(
      items,
      total,
      query.page,
      query.pageSize,
    );
  }

  async getLocationById(id: string): Promise<Location> {
    const record = await this.locationRepository.findById(id);
    if (!record) {
      throw new AppError("Location not found", 404);
    }
    return LocationFactory.toDomain(record);
  }

  async createLocation(input: CreateLocationInput): Promise<Location> {
    if (input.images.length < 1 || input.images.length > LOCATION_MAX_IMAGES) {
      throw new AppError("Location requires 1 to 5 images", 400);
    }

    const uploadedKeys: string[] = [];
    try {
      const images = [];
      for (const image of input.images) {
        const uploaded = await this.imageService.upload(image);
        uploadedKeys.push(uploaded.key);
        images.push({ imageNumber: images.length + 1, imageUrl: uploaded.url });
      }

      const record = await this.locationRepository.create({
        name: input.name,
        description: input.description,
        latitude: input.latitude,
        longitude: input.longitude,
        status: LocationStatus.ACTIVE,
        images,
      });
      return LocationFactory.toDomain(record);
    } catch (error) {
      await this.deleteImagesFromStorage(uploadedKeys);
      throw error;
    }
  }

  async updateLocation(id: string, input: UpdateLocationInput): Promise<Location> {
    const existing = await this.locationRepository.findById(id);
    if (!existing) {
      throw new AppError("Location not found", 404);
    }

    const existingImages = [...existing.images].sort(
      (first, second) => first.imageNumber - second.imageNumber,
    );
    const keepNumbers = input.keepImageNumbers;
    if (
      keepNumbers?.some(
        (number) => !existingImages.some((image) => image.imageNumber === number),
      )
    ) {
      throw new AppError("Image not found", 404);
    }
    if (keepNumbers && new Set(keepNumbers).size !== keepNumbers.length) {
      throw new AppError("Duplicate image number", 400);
    }

    const keptImages =
      keepNumbers === undefined
        ? existingImages
        : existingImages.filter((image) =>
            keepNumbers.includes(image.imageNumber),
          );
    const newImages = input.newImages ?? [];
    const hasImageChanges = keepNumbers !== undefined || newImages.length > 0;
    const imageCount = keptImages.length + newImages.length;
    if (hasImageChanges && (imageCount < 1 || imageCount > LOCATION_MAX_IMAGES)) {
      throw new AppError("Location requires 1 to 5 images", 400);
    }

    const uploadedKeys: string[] = [];
    try {
      const images = keptImages.map((image, index) => ({
        imageNumber: index + 1,
        imageUrl: image.imageUrl,
      }));
      for (const image of newImages) {
        const uploaded = await this.imageService.upload(image);
        uploadedKeys.push(uploaded.key);
        images.push({ imageNumber: images.length + 1, imageUrl: uploaded.url });
      }

      const update: UpdateLocationRecordInput = {
        name: input.name,
        description: input.description,
        latitude: input.latitude,
        longitude: input.longitude,
        status: input.status,
        ...(hasImageChanges ? { images } : {}),
      };
      const record = await this.locationRepository.update(id, update);

      const removedKeys = existingImages
        .filter((image) => !keptImages.includes(image))
        .flatMap((image) => extractImageKey(image.imageUrl) ?? []);
      await this.deleteImagesFromStorage(removedKeys);
      return LocationFactory.toDomain(record);
    } catch (error) {
      await this.deleteImagesFromStorage(uploadedKeys);
      throw error;
    }
  }

  async deleteLocationImage(id: string, imageNumber: number): Promise<Location> {
    const existing = await this.locationRepository.findById(id);
    if (!existing) {
      throw new AppError("Location not found", 404);
    }
    if (!existing.images.some((image) => image.imageNumber === imageNumber)) {
      throw new AppError("Image not found", 404);
    }

    return this.updateLocation(id, {
      keepImageNumbers: existing.images
        .filter((image) => image.imageNumber !== imageNumber)
        .map((image) => image.imageNumber),
    });
  }

  async deleteLocation(id: string): Promise<void> {
    const existing = await this.locationRepository.findById(id);
    if (!existing) {
      throw new AppError("Location not found", 404);
    }

    await this.locationRepository.delete(id);
    const keys = existing.images.flatMap((image) => extractImageKey(image.imageUrl) ?? []);
    await this.deleteImagesFromStorage(keys);
  }

  private async deleteImagesFromStorage(keys: string[]): Promise<void> {
    const results = await Promise.allSettled(
      keys.map((key) => this.imageService.delete({ key })),
    );
    for (const result of results) {
      if (result.status === "rejected") {
        console.error("Failed to remove location image from storage", result.reason);
      }
    }
  }
}
