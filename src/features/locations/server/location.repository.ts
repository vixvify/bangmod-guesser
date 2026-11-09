import { GameStatus, Prisma } from "@prisma/client";
import {
  LocationImagesChangedError,
  LocationImagesInUseError,
} from "./location.errors";
import { prisma } from "@/shared/lib/prisma";
import type { LocationRepository } from "@/features/locations/server/location.repository.port";
import type { LocationImageRecordInput } from "@/features/images/image.schema";
import type {
  CreateLocationInput,
  SearchLocationQueryInput,
  UpdateLocationInput,
} from "@/features/locations/location.schema";
import type { LocationStatus } from "@/features/locations/location";
import type {
  GetLocationRecordsResult,
  LocationModelWithImages,
} from "../../../../prisma/types/location";

export class LocationRepositoryImpl implements LocationRepository {
  async findMany(
    query: SearchLocationQueryInput,
  ): Promise<GetLocationRecordsResult> {
    const searchField =
      query.searchBy === "description" ? "description" : "name";

    const where: Prisma.LocationWhereInput = query.search
      ? {
          [searchField]: {
            contains: query.search,
            mode: "insensitive",
          },
        }
      : {};

    const orderDirection = query.orderBy === "asc" ? "asc" : "desc";

    const [total, items] = await Promise.all([
      prisma.location.count({ where }),
      prisma.location.findMany({
        where,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          images: true,
        },
        orderBy: {
          createdAt: orderDirection,
        },
      }),
    ]);

    return { total, items };
  }

  async findById(id: string): Promise<LocationModelWithImages | null> {
    return prisma.location.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });
  }

  async create(
    data: CreateLocationInput,
    status: LocationStatus,
    images: LocationImageRecordInput[],
  ): Promise<LocationModelWithImages> {
    return prisma.location.create({
      data: {
        name: data.name,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        status,
        images: {
          create: images.map((image) => ({
            imageNumber: image.imageNumber,
            imageUrl: image.imageUrl,
          })),
        },
      },
      include: {
        images: true,
      },
    });
  }

  async update(
    id: string,
    data: UpdateLocationInput,
    images?: LocationImageRecordInput[],
    expectedImages?: LocationImageRecordInput[],
  ): Promise<LocationModelWithImages> {
    if (images === undefined) {
      return prisma.location.update({
        where: { id },
        data,
        include: { images: true },
      });
    }

    try {
      return await prisma.$transaction(
        async (transaction) => {
          const requestedNumbers = images.map((image) => image.imageNumber);

          await transaction.location.update({
            where: { id },
            data,
          });

          const existingImages = await transaction.locationImage.findMany({
            where: { locationId: id },
            select: {
              imageNumber: true,
              imageUrl: true,
            },
          });

          if (
            expectedImages &&
            (existingImages.length !== expectedImages.length ||
              existingImages.some(
                (image) =>
                  !expectedImages.some(
                    (expected) =>
                      expected.imageNumber === image.imageNumber &&
                      expected.imageUrl === image.imageUrl,
                  ),
              ))
          ) {
            throw new LocationImagesChangedError();
          }

          const requestedNumberSet = new Set(requestedNumbers);

          const removedImages = existingImages.filter(
            (image) => !requestedNumberSet.has(image.imageNumber),
          );

          const changedNumbers = existingImages
            .filter(
              (image) =>
                !images.some(
                  (requested) =>
                    requested.imageNumber === image.imageNumber &&
                    requested.imageUrl === image.imageUrl,
                ),
            )
            .map((image) => image.imageNumber);

          const removedNumbers = removedImages.map(
            (image) => image.imageNumber,
          );

          if (changedNumbers.length > 0) {
            const playingRound = await transaction.gameRound.findFirst({
              where: {
                locationId: id,
                imageNumber: { in: changedNumbers },
                game: {
                  is: {
                    status: GameStatus.PLAYING,
                  },
                },
              },
              select: {
                gameId: true,
                questionNumber: true,
              },
            });

            if (playingRound) {
              throw new LocationImagesInUseError();
            }

            await transaction.gameRound.updateMany({
              where: {
                locationId: id,
                imageNumber: { in: changedNumbers },
                game: {
                  is: {
                    status: {
                      in: [GameStatus.COMPLETED, GameStatus.INCOMPLETE],
                    },
                  },
                },
              },
              data: {
                imageNumber: null,
              },
            });

            await transaction.locationImage.deleteMany({
              where: {
                locationId: id,
                imageNumber: { in: removedNumbers },
              },
            });
          }

          const existingNumberSet = new Set(
            existingImages.map((image) => image.imageNumber),
          );

          const newImages = images.filter(
            (image) => !existingNumberSet.has(image.imageNumber),
          );

          const updatedImages = images.filter((image) => {
            const existing = existingImages.find(
              (item) => item.imageNumber === image.imageNumber,
            );

            return existing && existing.imageUrl !== image.imageUrl;
          });

          if (newImages.length > 0) {
            await transaction.locationImage.createMany({
              data: newImages.map((image) => ({
                locationId: id,
                imageNumber: image.imageNumber,
                imageUrl: image.imageUrl,
              })),
            });
          }

          for (const image of updatedImages) {
            await transaction.locationImage.update({
              where: {
                locationId_imageNumber: {
                  locationId: id,
                  imageNumber: image.imageNumber,
                },
              },
              data: {
                imageUrl: image.imageUrl,
              },
            });
          }

          return transaction.location.findUniqueOrThrow({
            where: { id },
            include: { images: true },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034"
      ) {
        throw new LocationImagesChangedError();
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await prisma.location.delete({
      where: { id },
    });
  }
}
