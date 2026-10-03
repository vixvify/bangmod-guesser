import { prisma } from "@/lib/prisma";
import type {
  CreateLocationRepositoryInput,
  FindLocationsQuery,
  LocationRepository,
  UpdateLocationRepositoryInput,
} from "@/core/ports/location.repository";
import type { LocationModelWithImages } from "../../../prisma/types/location";
import type { Prisma } from "@prisma/client";

export class LocationRepositoryImpl implements LocationRepository {
  async findMany(query: FindLocationsQuery): Promise<{
    items: LocationModelWithImages[];
    total: number;
  }> {
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
        skip: query.skip,
        take: query.take,
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
    data: CreateLocationRepositoryInput,
  ): Promise<LocationModelWithImages> {
    return prisma.location.create({
      data: {
        name: data.name,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        status: data.status,
        images: {
          create: data.images.map((img) => ({
            imageNumber: img.imageNumber,
            imageUrl: img.imageUrl,
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
    data: UpdateLocationRepositoryInput,
  ): Promise<LocationModelWithImages> {
    return prisma.location.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        status: data.status,
      },
      include: {
        images: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.location.delete({
      where: { id },
    });
  }

  async updateImage(
    locationId: string,
    imageNumber: number,
    imageUrl: string,
  ): Promise<void> {
    await prisma.locationImage.upsert({
      where: {
        locationId_imageNumber: {
          locationId,
          imageNumber,
        },
      },
      update: {
        imageUrl,
      },
      create: {
        locationId,
        imageNumber,
        imageUrl,
      },
    });
  }

  async deleteImages(
    locationId: string,
    imageNumbers: number[],
  ): Promise<void> {
    await prisma.locationImage.deleteMany({
      where: {
        locationId,
        imageNumber: {
          in: imageNumbers,
        },
      },
    });
  }

  async setLocationImages(
    locationId: string,
    images: Array<{
      imageNumber: number;
      imageUrl: string;
    }>,
  ): Promise<void> {
    await prisma.$transaction([
      prisma.locationImage.deleteMany({
        where: { locationId },
      }),
      prisma.locationImage.createMany({
        data: images.map((img) => ({
          locationId,
          imageNumber: img.imageNumber,
          imageUrl: img.imageUrl,
        })),
      }),
    ]);
  }
}
