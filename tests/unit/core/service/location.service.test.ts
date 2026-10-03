import { describe, expect, it } from "vitest";
import { LocationService } from "@/core/service/location.service";
import { LocationStatus } from "@/core/domain/location";
import { createLocationRepositoryMock } from "../../../mocks/location.repository.mock";
import { createImageRepositoryMock } from "../../../mocks/image.repository.mock";
import { ImageService } from "@/core/service/image.service";
import { AppError } from "@/core/errors/app.error";

const sampleImageBuffer = new Uint8Array([1, 2, 3, 4]);

function createTestService() {
  const locationRepository = createLocationRepositoryMock();
  const imageRepository = createImageRepositoryMock();
  const imageService = new ImageService(imageRepository);
  const locationService = new LocationService(
    locationRepository,
    imageService,
  );

  return { locationService, locationRepository, imageRepository, imageService };
}

describe("LocationService", () => {
  describe("getLocations", () => {
    it("returns paginated locations", async () => {
      const { locationService, locationRepository } = createTestService();
      locationRepository.findMany.mockResolvedValue({
        total: 1,
        items: [
          {
            id: "loc_1",
            name: "CB2",
            description: "Classroom Building 2",
            latitude: 13.652,
            longitude: 100.493,
            status: LocationStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
            images: [
              {
                locationId: "loc_1",
                imageNumber: 1,
                imageUrl: "https://example.com/images/1.jpg",
                createdAt: new Date(),
              },
            ],
          },
        ],
      });

      const result = await locationService.getLocations({
        search: "CB2",
        searchBy: "name",
        page: 1,
        pageSize: 10,
        orderBy: "asc",
      });

      expect(result.total).toBe(1);
      expect(result.items[0].name).toBe("CB2");
      expect(result.items[0].images).toHaveLength(1);
      expect(locationRepository.findMany).toHaveBeenCalledWith({
        search: "CB2",
        searchBy: "name",
        skip: 0,
        take: 10,
        orderBy: "asc",
      });
    });
  });

  describe("getLocationById", () => {
    it("returns location when found", async () => {
      const { locationService, locationRepository } = createTestService();
      locationRepository.findById.mockResolvedValue({
        id: "loc_1",
        name: "CB2",
        description: null,
        latitude: 13.652,
        longitude: 100.493,
        status: LocationStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: null,
        images: [],
      });

      const result = await locationService.getLocationById("loc_1");
      expect(result.id).toBe("loc_1");
      expect(result.name).toBe("CB2");
    });

    it("throws 404 when location does not exist", async () => {
      const { locationService, locationRepository } = createTestService();
      locationRepository.findById.mockResolvedValue(null);

      await expect(
        locationService.getLocationById("unknown"),
      ).rejects.toThrowError(new AppError("Location not found", 404));
    });
  });

  describe("createLocation", () => {
    it("rejects when images count is less than 1", async () => {
      const { locationService } = createTestService();

      await expect(
        locationService.createLocation({
          name: "Building",
          latitude: 13.65,
          longitude: 100.49,
          images: [],
        }),
      ).rejects.toThrowError(new AppError("Location requires 1 to 5 images", 400));
    });

    it("rejects when images count exceeds 5", async () => {
      const { locationService } = createTestService();
      const sixImages = [1, 2, 3, 4, 5, 6].map(() => ({
        contentType: "image/jpeg" as const,
        content: sampleImageBuffer,
      }));

      await expect(
        locationService.createLocation({
          name: "Building",
          latitude: 13.65,
          longitude: 100.49,
          images: sixImages,
        }),
      ).rejects.toThrowError(new AppError("Location requires 1 to 5 images", 400));
    });

    it("uploads 3 images and saves location dynamically", async () => {
      const { locationService, locationRepository, imageRepository } =
        createTestService();

      imageRepository.upload.mockResolvedValue();
      imageRepository.getPublicUrl.mockImplementation(
        (key) => `https://example.com/${key}`,
      );

      locationRepository.create.mockResolvedValue({
        id: "loc_new",
        name: "SIT Building",
        description: "School of IT",
        latitude: 13.652,
        longitude: 100.494,
        status: LocationStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: null,
        images: [1, 2, 3].map((num) => ({
          locationId: "loc_new",
          imageNumber: num,
          imageUrl: `https://example.com/images/file_${num}.jpg`,
          createdAt: new Date(),
        })),
      });

      const threeImages = [1, 2, 3].map(() => ({
        contentType: "image/jpeg" as const,
        content: sampleImageBuffer,
      }));

      const result = await locationService.createLocation({
        name: "SIT Building",
        description: "School of IT",
        latitude: 13.652,
        longitude: 100.494,
        images: threeImages,
      });

      expect(result.id).toBe("loc_new");
      expect(imageRepository.upload).toHaveBeenCalledTimes(3);
      expect(locationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "SIT Building",
          images: expect.arrayContaining([
            expect.objectContaining({ imageNumber: 1 }),
            expect.objectContaining({ imageNumber: 3 }),
          ]),
        }),
      );
    });

    it("cleans up uploaded images from storage if database creation fails", async () => {
      const { locationService, locationRepository, imageRepository } =
        createTestService();

      imageRepository.upload.mockResolvedValue();
      imageRepository.getPublicUrl.mockImplementation(
        (key) => `https://example.com/${key}`,
      );
      imageRepository.delete.mockResolvedValue();

      locationRepository.create.mockRejectedValue(new Error("Database error"));

      await expect(
        locationService.createLocation({
          name: "Faulty Location",
          latitude: 13.65,
          longitude: 100.49,
          images: [
            { contentType: "image/jpeg", content: sampleImageBuffer },
          ],
        }),
      ).rejects.toThrow("Database error");

      expect(imageRepository.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateLocation", () => {
    it("throws 404 if location to update does not exist", async () => {
      const { locationService, locationRepository } = createTestService();
      locationRepository.findById.mockResolvedValue(null);

      await expect(
        locationService.updateLocation("not_found", { name: "New Name" }),
      ).rejects.toThrowError(new AppError("Location not found", 404));
    });

    it("deletes specified images, resequences remaining, and cleans up storage", async () => {
      const { locationService, locationRepository, imageRepository } =
        createTestService();

      locationRepository.findById.mockResolvedValue({
        id: "loc_1",
        name: "CB2",
        description: null,
        latitude: 13.65,
        longitude: 100.49,
        status: LocationStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: null,
        images: [
          {
            locationId: "loc_1",
            imageNumber: 1,
            imageUrl: "https://example.com/images/3f2504e0-4f89-11d3-9a0c-0305e82c3301.jpg",
            createdAt: new Date(),
          },
          {
            locationId: "loc_1",
            imageNumber: 2,
            imageUrl: "https://example.com/images/3f2504e0-4f89-11d3-9a0c-0305e82c3302.jpg",
            createdAt: new Date(),
          },
          {
            locationId: "loc_1",
            imageNumber: 3,
            imageUrl: "https://example.com/images/3f2504e0-4f89-11d3-9a0c-0305e82c3303.jpg",
            createdAt: new Date(),
          },
        ],
      });

      imageRepository.delete.mockResolvedValue();
      locationRepository.update.mockImplementation(async () =>
        (await locationRepository.findById("loc_1"))!,
      );

      await locationService.updateLocation("loc_1", {
        keepImageNumbers: [1, 3],
      });

      expect(imageRepository.delete).toHaveBeenCalledWith(
        "images/3f2504e0-4f89-11d3-9a0c-0305e82c3302.jpg",
      );
      expect(locationRepository.update).toHaveBeenCalledWith(
        "loc_1",
        expect.objectContaining({ images: [
          {
            imageNumber: 1,
            imageUrl: "https://example.com/images/3f2504e0-4f89-11d3-9a0c-0305e82c3301.jpg",
          },
          {
            imageNumber: 2,
            imageUrl: "https://example.com/images/3f2504e0-4f89-11d3-9a0c-0305e82c3303.jpg",
          },
        ] }),
      );
    });

    it("rejects when all images are deleted and none remain", async () => {
      const { locationService, locationRepository } = createTestService();

      locationRepository.findById.mockResolvedValue({
        id: "loc_1",
        name: "CB2",
        description: null,
        latitude: 13.65,
        longitude: 100.49,
        status: LocationStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: null,
        images: [
          {
            locationId: "loc_1",
            imageNumber: 1,
            imageUrl: "https://example.com/images/1.jpg",
            createdAt: new Date(),
          },
        ],
      });

      await expect(
        locationService.updateLocation("loc_1", {
          keepImageNumbers: [],
        }),
      ).rejects.toThrowError(new AppError("Location requires 1 to 5 images", 400));
    });

    it("cleans up newly uploaded images from storage if database update fails", async () => {
      const { locationService, locationRepository, imageRepository } =
        createTestService();

      locationRepository.findById.mockResolvedValue({
        id: "loc_1",
        name: "CB2",
        description: null,
        latitude: 13.65,
        longitude: 100.49,
        status: LocationStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: null,
        images: [
          {
            locationId: "loc_1",
            imageNumber: 1,
            imageUrl: "https://example.com/images/1.jpg",
            createdAt: new Date(),
          },
        ],
      });

      imageRepository.upload.mockResolvedValue();
      imageRepository.getPublicUrl.mockImplementation(
        (key) => `https://example.com/${key}`,
      );
      imageRepository.delete.mockResolvedValue();

      locationRepository.update.mockRejectedValue(
        new Error("Failed to update images"),
      );

      await expect(
        locationService.updateLocation("loc_1", {
          newImages: [
            { contentType: "image/jpeg", content: sampleImageBuffer },
          ],
        }),
      ).rejects.toThrow("Failed to update images");

      expect(imageRepository.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteLocationImage", () => {
    it("throws 400 if location only has 1 image", async () => {
      const { locationService, locationRepository } = createTestService();
      locationRepository.findById.mockResolvedValue({
        id: "loc_1",
        name: "CB2",
        description: null,
        latitude: 13.65,
        longitude: 100.49,
        status: LocationStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: null,
        images: [
          {
            locationId: "loc_1",
            imageNumber: 1,
            imageUrl: "https://example.com/images/1.jpg",
            createdAt: new Date(),
          },
        ],
      });

      await expect(
        locationService.deleteLocationImage("loc_1", 1),
      ).rejects.toThrowError(new AppError("Location requires 1 to 5 images", 400));
    });

    it("throws 404 if image to delete is not found", async () => {
      const { locationService, locationRepository } = createTestService();
      locationRepository.findById.mockResolvedValue({
        id: "loc_1",
        name: "CB2",
        description: null,
        latitude: 13.65,
        longitude: 100.49,
        status: LocationStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: null,
        images: [
          {
            locationId: "loc_1",
            imageNumber: 1,
            imageUrl: "https://example.com/images/1.jpg",
            createdAt: new Date(),
          },
          {
            locationId: "loc_1",
            imageNumber: 2,
            imageUrl: "https://example.com/images/2.jpg",
            createdAt: new Date(),
          },
        ],
      });

      await expect(
        locationService.deleteLocationImage("loc_1", 9),
      ).rejects.toThrowError(new AppError("Image not found", 404));
    });

    it("deletes target image, resequences remaining images, and cleans storage", async () => {
      const { locationService, locationRepository, imageRepository } =
        createTestService();

      locationRepository.findById.mockResolvedValue({
        id: "loc_1",
        name: "CB2",
        description: null,
        latitude: 13.65,
        longitude: 100.49,
        status: LocationStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: null,
        images: [
          {
            locationId: "loc_1",
            imageNumber: 1,
            imageUrl: "https://example.com/images/3f2504e0-4f89-11d3-9a0c-0305e82c3301.jpg",
            createdAt: new Date(),
          },
          {
            locationId: "loc_1",
            imageNumber: 2,
            imageUrl: "https://example.com/images/3f2504e0-4f89-11d3-9a0c-0305e82c3302.jpg",
            createdAt: new Date(),
          },
          {
            locationId: "loc_1",
            imageNumber: 3,
            imageUrl: "https://example.com/images/3f2504e0-4f89-11d3-9a0c-0305e82c3303.jpg",
            createdAt: new Date(),
          },
        ],
      });

      imageRepository.delete.mockResolvedValue();
      locationRepository.update.mockImplementation(async () =>
        (await locationRepository.findById("loc_1"))!,
      );

      await locationService.deleteLocationImage("loc_1", 2);

      expect(imageRepository.delete).toHaveBeenCalledWith(
        "images/3f2504e0-4f89-11d3-9a0c-0305e82c3302.jpg",
      );
      expect(locationRepository.update).toHaveBeenCalledWith(
        "loc_1",
        expect.objectContaining({ images: [
          {
            imageNumber: 1,
            imageUrl: "https://example.com/images/3f2504e0-4f89-11d3-9a0c-0305e82c3301.jpg",
          },
          {
            imageNumber: 2,
            imageUrl: "https://example.com/images/3f2504e0-4f89-11d3-9a0c-0305e82c3303.jpg",
          },
        ] }),
      );
    });
  });

  describe("deleteLocation", () => {
    it("throws 404 when location does not exist", async () => {
      const { locationService, locationRepository } = createTestService();
      locationRepository.findById.mockResolvedValue(null);

      await expect(
        locationService.deleteLocation("not_found"),
      ).rejects.toThrowError(new AppError("Location not found", 404));
    });

    it("deletes location and cleans up its images from storage", async () => {
      const { locationService, locationRepository, imageRepository } =
        createTestService();

      locationRepository.findById.mockResolvedValue({
        id: "loc_1",
        name: "CB2",
        description: null,
        latitude: 13.65,
        longitude: 100.49,
        status: LocationStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: null,
        images: [
          {
            locationId: "loc_1",
            imageNumber: 1,
            imageUrl: "https://example.com/images/3f2504e0-4f89-11d3-9a0c-0305e82c3301.jpg",
            createdAt: new Date(),
          },
        ],
      });
      imageRepository.delete.mockResolvedValue();
      locationRepository.delete.mockResolvedValue();

      await locationService.deleteLocation("loc_1");

      expect(imageRepository.delete).toHaveBeenCalledWith(
        "images/3f2504e0-4f89-11d3-9a0c-0305e82c3301.jpg",
      );
      expect(locationRepository.delete).toHaveBeenCalledWith("loc_1");
    });
  });
});
