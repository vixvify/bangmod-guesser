import { AppError } from "../errors/app.error";
import type { LocationRepository } from "../ports/location.repository";
import type { ImageService } from "./image.service";
import type { UploadImageInput } from "../schema/image.schema";
import {
  LocationStatus,
  type Location,
  type PaginatedLocations,
} from "../domain/location";
import { LocationFactory } from "@/infrastructure/factories/location.factory";

export interface CreateLocationImageItem {
  contentType: UploadImageInput["contentType"];
  content: UploadImageInput["content"];
}

export interface CreateLocationDto {
  name: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  images: CreateLocationImageItem[];
}

export interface ReplaceImageItem {
  imageNumber: number;
  contentType: UploadImageInput["contentType"];
  content: UploadImageInput["content"];
}

export interface UpdateLocationDto {
  name?: string;
  description?: string | null;
  latitude?: number;
  longitude?: number;
  status?: LocationStatus;
  deleteImageNumbers?: number[];
  replacementImages?: ReplaceImageItem[];
  newImages?: CreateLocationImageItem[];
}

function extractImageKey(url: string): string | null {
  const match = url.match(/images\/[a-f0-9-]+\.(jpg|png|webp)/);
  return match ? match[0] : null;
}

export class LocationService {
  constructor(
    private readonly locationRepository: LocationRepository,
    private readonly imageService: ImageService,
  ) {}

  async getLocations(params: {
    search?: string;
    searchBy?: "name" | "description";
    page: number;
    pageSize: number;
    orderBy?: "asc" | "desc";
  }): Promise<PaginatedLocations> {
    const skip = (params.page - 1) * params.pageSize;
    const take = params.pageSize;

    const { items, total } = await this.locationRepository.findMany({
      search: params.search,
      searchBy: params.searchBy,
      skip,
      take,
      orderBy: params.orderBy,
    });

    return LocationFactory.toPaginatedDomain(
      items,
      total,
      params.page,
      params.pageSize,
    );
  }

  async getLocationById(id: string): Promise<Location> {
    const record = await this.locationRepository.findById(id);

    if (!record) {
      throw new AppError("Location not found", 404);
    }

    return LocationFactory.toDomain(record);
  }

  async createLocation(input: CreateLocationDto): Promise<Location> {
    if (!input.images || input.images.length < 1) {
      throw new AppError("At least 1 image is required", 400);
    }

    if (input.images.length > 5) {
      throw new AppError("Maximum 5 images allowed", 400);
    }

    const newlyUploadedKeys: string[] = [];
    const uploadedImages: Array<{ imageNumber: number; imageUrl: string }> = [];

    try {
      for (let index = 0; index < input.images.length; index += 1) {
        const item = input.images[index];
        const uploaded = await this.imageService.upload({
          contentType: item.contentType,
          content: item.content,
        });

        newlyUploadedKeys.push(uploaded.key);
        uploadedImages.push({
          imageNumber: index + 1,
          imageUrl: uploaded.url,
        });
      }

      const created = await this.locationRepository.create({
        name: input.name,
        description: input.description,
        latitude: input.latitude,
        longitude: input.longitude,
        status: LocationStatus.ACTIVE,
        images: uploadedImages,
      });

      return LocationFactory.toDomain(created);
    } catch (error) {
      for (const key of newlyUploadedKeys) {
        try {
          await this.imageService.delete({ key });
        } catch {}
      }
      throw error;
    }
  }

  async updateLocation(
    id: string,
    input: UpdateLocationDto,
  ): Promise<Location> {
    const existing = await this.locationRepository.findById(id);

    if (!existing) {
      throw new AppError("Location not found", 404);
    }

    const newlyUploadedKeys: string[] = [];
    const keysToDeleteFromR2: string[] = [];

    try {
      let currentImages = existing.images.map((img) => ({
        imageNumber: img.imageNumber,
        imageUrl: img.imageUrl,
      }));

      let hasImageChanges = false;

      if (input.deleteImageNumbers && input.deleteImageNumbers.length > 0) {
        hasImageChanges = true;
        for (const num of input.deleteImageNumbers) {
          const target = currentImages.find((img) => img.imageNumber === num);
          if (target) {
            const key = extractImageKey(target.imageUrl);
            if (key) {
              keysToDeleteFromR2.push(key);
            }
            currentImages = currentImages.filter((img) => img.imageNumber !== num);
          }
        }
      }

      if (input.replacementImages && input.replacementImages.length > 0) {
        hasImageChanges = true;
        for (const replacement of input.replacementImages) {
          const oldImage = currentImages.find(
            (img) => img.imageNumber === replacement.imageNumber,
          );

          if (oldImage) {
            const key = extractImageKey(oldImage.imageUrl);
            if (key) {
              keysToDeleteFromR2.push(key);
            }

            const uploaded = await this.imageService.upload({
              contentType: replacement.contentType,
              content: replacement.content,
            });

            newlyUploadedKeys.push(uploaded.key);
            oldImage.imageUrl = uploaded.url;
          }
        }
      }

      if (input.newImages && input.newImages.length > 0) {
        hasImageChanges = true;
        for (const newImg of input.newImages) {
          if (currentImages.length >= 5) {
            throw new AppError("Maximum 5 images allowed", 400);
          }

          const uploaded = await this.imageService.upload({
            contentType: newImg.contentType,
            content: newImg.content,
          });

          newlyUploadedKeys.push(uploaded.key);
          currentImages.push({
            imageNumber: currentImages.length + 1,
            imageUrl: uploaded.url,
          });
        }
      }

      if (hasImageChanges) {
        if (currentImages.length < 1) {
          throw new AppError("Location must have at least 1 image", 400);
        }

        if (currentImages.length > 5) {
          throw new AppError("Maximum 5 images allowed", 400);
        }

        currentImages.sort((a, b) => a.imageNumber - b.imageNumber);
        const resequenced = currentImages.map((img, index) => ({
          imageNumber: index + 1,
          imageUrl: img.imageUrl,
        }));

        await this.locationRepository.setLocationImages(id, resequenced);
      }

      const hasFieldUpdates =
        input.name !== undefined ||
        input.description !== undefined ||
        input.latitude !== undefined ||
        input.longitude !== undefined ||
        input.status !== undefined;

      if (hasFieldUpdates) {
        await this.locationRepository.update(id, {
          name: input.name,
          description: input.description,
          latitude: input.latitude,
          longitude: input.longitude,
          status: input.status,
        });
      }

      for (const key of keysToDeleteFromR2) {
        try {
          await this.imageService.delete({ key });
        } catch {}
      }

      const updated = await this.locationRepository.findById(id);
      return LocationFactory.toDomain(updated!);
    } catch (error) {
      for (const key of newlyUploadedKeys) {
        try {
          await this.imageService.delete({ key });
        } catch {}
      }
      throw error;
    }
  }

  async deleteLocationImage(
    locationId: string,
    imageNumber: number,
  ): Promise<Location> {
    const existing = await this.locationRepository.findById(locationId);

    if (!existing) {
      throw new AppError("Location not found", 404);
    }

    if (existing.images.length <= 1) {
      throw new AppError("Location must have at least 1 image", 400);
    }

    const target = existing.images.find(
      (img) => img.imageNumber === imageNumber,
    );

    if (!target) {
      throw new AppError("Image not found", 404);
    }

    const remaining = existing.images
      .filter((img) => img.imageNumber !== imageNumber)
      .sort((a, b) => a.imageNumber - b.imageNumber);

    const resequenced = remaining.map((img, index) => ({
      imageNumber: index + 1,
      imageUrl: img.imageUrl,
    }));

    await this.locationRepository.setLocationImages(locationId, resequenced);

    const key = extractImageKey(target.imageUrl);
    if (key) {
      try {
        await this.imageService.delete({ key });
      } catch {}
    }

    const updated = await this.locationRepository.findById(locationId);
    return LocationFactory.toDomain(updated!);
  }

  async deleteLocation(id: string): Promise<void> {
    const existing = await this.locationRepository.findById(id);

    if (!existing) {
      throw new AppError("Location not found", 404);
    }

    for (const image of existing.images) {
      const key = extractImageKey(image.imageUrl);
      if (key) {
        try {
          await this.imageService.delete({ key });
        } catch {}
      }
    }

    await this.locationRepository.delete(id);
  }
}
