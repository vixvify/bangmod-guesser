import { AppError } from "../../../shared/errors/app.error";
import { LOCATION_MAX_IMAGES } from "../location.constants";
import {
  LocationStatus,
  type Location,
  type PaginatedLocations,
} from "../location";
import type { LocationRepository } from "./location.repository.port";
import type {
  UploadImageInput,
  UpdateLocationImagesInput,
} from "../../images/image.schema";
import {
  ImageNumberSchema,
  LocationImageRecordSchema,
} from "../../images/image.schema";
import type {
  CreateLocationInput,
  SearchLocationQueryInput,
  UpdateLocationInput,
} from "../location.schema";
import type { ImageService } from "../../images/server/image.service";
import { LocationFactory } from "@/features/locations/server/location.factory";
import { extractImageKey } from "@/features/images/server/image-key";
import {
  LocationImagesChangedError,
  LocationImagesInUseError,
} from "./location.errors";

export class LocationService {
  constructor(
    private readonly locationRepository: LocationRepository,
    private readonly imageService: ImageService,
  ) {}

  async getLocations(
    query: SearchLocationQueryInput,
  ): Promise<PaginatedLocations> {
    const { items, total } = await this.locationRepository.findMany(query);

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

  async createLocation(
    input: CreateLocationInput,
    imagesToUpload: UploadImageInput[],
  ): Promise<Location> {
    if (
      imagesToUpload.length < 1 ||
      imagesToUpload.length > LOCATION_MAX_IMAGES
    ) {
      throw new AppError("Location requires 1 to 5 images", 400);
    }

    const uploadedKeys: string[] = [];
    try {
      const images = [];
      for (const image of imagesToUpload) {
        const uploaded = await this.imageService.upload(image);
        uploadedKeys.push(uploaded.key);

        images.push(
          LocationImageRecordSchema.parse({
            imageNumber: images.length + 1,
            imageUrl: uploaded.url,
          }),
        );
      }

      const record = await this.locationRepository.create(
        input,
        LocationStatus.ACTIVE,
        images,
      );
      return LocationFactory.toDomain(record);
    } catch (error) {
      await this.deleteImagesFromStorage(uploadedKeys);
      throw error;
    }
  }

  async updateLocation(
    id: string,
    input: UpdateLocationInput,
    imageChanges: UpdateLocationImagesInput = {},
  ): Promise<Location> {
    const existing = await this.locationRepository.findById(id);
    if (!existing) {
      throw new AppError("Location not found", 404);
    }

    const existingImages = [...existing.images].sort(
      (first, second) => first.imageNumber - second.imageNumber,
    );
    if (
      imageChanges.expectedImages &&
      (existingImages.length !== imageChanges.expectedImages.length ||
        existingImages.some(
          (image) =>
            !imageChanges.expectedImages?.some(
              (expected) =>
                expected.imageNumber === image.imageNumber &&
                expected.imageUrl === image.imageUrl,
            ),
        ))
    ) {
      throw new AppError(
        "Location images have changed. Please reload and try again",
        409,
      );
    }

    const keepNumbers = imageChanges.keepImageNumbers;
    if (
      keepNumbers?.some(
        (number) => !ImageNumberSchema.safeParse(number).success,
      )
    ) {
      throw new AppError("Invalid image number", 400);
    }
    if (
      keepNumbers?.some(
        (number) =>
          !existingImages.some((image) => image.imageNumber === number),
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
    const newImages = imageChanges.newImages ?? [];
    const hasImageChanges = keepNumbers !== undefined || newImages.length > 0;

    const imageCount = keptImages.length + newImages.length;
    if (
      hasImageChanges &&
      (imageCount < 1 || imageCount > LOCATION_MAX_IMAGES)
    ) {
      throw new AppError("Location requires 1 to 5 images", 400);
    }

    const uploadedKeys: string[] = [];
    try {
      const images = keptImages.map((image) => ({
        imageNumber: image.imageNumber,
        imageUrl: image.imageUrl,
      }));
      const usedNumbers = new Set(images.map((image) => image.imageNumber));
      for (const image of newImages) {
        const imageNumber = Array.from(
          { length: LOCATION_MAX_IMAGES },
          (_, index) => index + 1,
        ).find((number) => !usedNumbers.has(number));

        if (imageNumber === undefined) {
          throw new AppError("Location requires 1 to 5 images", 400);
        }

        const uploaded = await this.imageService.upload(image);
        uploadedKeys.push(uploaded.key);

        images.push(
          LocationImageRecordSchema.parse({
            imageNumber,
            imageUrl: uploaded.url,
          }),
        );

        usedNumbers.add(imageNumber);
      }

      const record = await this.locationRepository.update(
        id,
        input,
        hasImageChanges ? images : undefined,
        hasImageChanges
          ? existingImages.map(({ imageNumber, imageUrl }) => ({
              imageNumber,
              imageUrl,
            }))
          : undefined,
      );

      const keptNumbers = new Set(keptImages.map((image) => image.imageNumber));

      const removedKeys = existingImages
        .filter((image) => !keptNumbers.has(image.imageNumber))
        .flatMap((image) => extractImageKey(image.imageUrl) ?? []);
      await this.deleteImagesFromStorage(removedKeys);
      return LocationFactory.toDomain(record);
    } catch (error) {
      await this.deleteImagesFromStorage(uploadedKeys);
      if (error instanceof LocationImagesInUseError) {
        throw new AppError(error.message, 409);
      }
      if (error instanceof LocationImagesChangedError) {
        throw new AppError(
          "Location images have changed. Please reload and try again",
          409,
        );
      }
      throw error;
    }
  }

  async deleteLocationImage(
    id: string,
    imageNumber: number,
  ): Promise<Location> {
    const existing = await this.locationRepository.findById(id);
    if (!existing) {
      throw new AppError("Location not found", 404);
    }
    if (!existing.images.some((image) => image.imageNumber === imageNumber)) {
      throw new AppError("Image not found", 404);
    }

    return this.updateLocation(
      id,
      {},
      {
        keepImageNumbers: existing.images
          .filter((image) => image.imageNumber !== imageNumber)
          .map((image) => image.imageNumber),
        expectedImages: existing.images.map(({ imageNumber, imageUrl }) => ({
          imageNumber,
          imageUrl,
        })),
      },
    );
  }

  async deleteLocation(id: string): Promise<void> {
    const existing = await this.locationRepository.findById(id);
    if (!existing) {
      throw new AppError("Location not found", 404);
    }

    await this.locationRepository.delete(id);
    const keys = existing.images.flatMap(
      (image) => extractImageKey(image.imageUrl) ?? [],
    );
    await this.deleteImagesFromStorage(keys);
  }

  private async deleteImagesFromStorage(keys: string[]): Promise<void> {
    const results = await Promise.allSettled(
      keys.map((key) => this.imageService.delete({ key })),
    );
    for (const result of results) {
      if (result.status === "rejected") {
        console.error(
          "Failed to remove location image from storage",
          result.reason,
        );
      }
    }
  }
}
