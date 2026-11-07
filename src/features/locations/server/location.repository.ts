import { GameStatus, Prisma } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import type {
  LocationRepository,
  LocationUpdateResult,
} from "@/features/locations/server/location.repository.port";
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
  ): Promise<LocationUpdateResult> {
    if (images === undefined) {
      const location = await prisma.location.update({
        where: { id },
        data,
        include: { images: true },
      });

      return {
        status: "UPDATED",
        location,
      };
    }

    return prisma.$transaction(
      async (transaction): Promise<LocationUpdateResult> => {
        const existingImages = await transaction.locationImage.findMany({
          where: { locationId: id },
          select: {
            imageNumber: true,
            imageUrl: true,
          },
        });

        const requestedImages = new Map(
          images.map((image) => [image.imageNumber, image.imageUrl]),
        );

        const affectedImages = existingImages.filter((existing) => {
          const requestedUrl = requestedImages.get(existing.imageNumber);

          return (
            requestedUrl === undefined ||
            requestedUrl !== existing.imageUrl
          );
        });

        const affectedNumbers = affectedImages.map(
          (image) => image.imageNumber,
        );

        if (affectedNumbers.length > 0) {
          const playingRound = await transaction.gameRound.findFirst({
            where: {
              locationId: id,
              imageNumber: { in: affectedNumbers },
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
            return {
              status: "IMAGE_IN_USE",
            };
          }

          await transaction.gameRound.updateMany({
            where: {
              locationId: id,
              imageNumber: { in: affectedNumbers },
              game: {
                is: {
                  status: {
                    in: [
                      GameStatus.COMPLETED,
                      GameStatus.INCOMPLETE,
                    ],
                  },
                },
              },
            },
            data: {
              imageNumber: null,
            },
          });
        }

        const existingNumberSet = new Set(
          existingImages.map((image) => image.imageNumber),
        );

        const requestedNumberSet = new Set(
          images.map((image) => image.imageNumber),
        );

        const deletedNumbers = existingImages
          .filter((image) => !requestedNumberSet.has(image.imageNumber))
          .map((image) => image.imageNumber);

        if (deletedNumbers.length > 0) {
          await transaction.locationImage.deleteMany({
            where: {
              locationId: id,
              imageNumber: { in: deletedNumbers },
            },
          });
        }

        const newImages = images.filter(
          (image) => !existingNumberSet.has(image.imageNumber),
        );

        if (newImages.length > 0) {
          await transaction.locationImage.createMany({
            data: newImages.map((image) => ({
              locationId: id,
              imageNumber: image.imageNumber,
              imageUrl: image.imageUrl,
            })),
          });
        }

        const replacedImages = images.filter((image) => {
          const existing = existingImages.find(
            (item) => item.imageNumber === image.imageNumber,
          );

          return existing !== undefined && existing.imageUrl !== image.imageUrl;
        });

        for (const image of replacedImages) {
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

        const location = await transaction.location.update({
          where: { id },
          data,
          include: {
            images: true,
          },
        });

        return {
          status: "UPDATED",
          location,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async delete(id: string): Promise<void> {
    await prisma.location.delete({
      where: { id },
    });
  }
}
