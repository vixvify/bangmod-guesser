import { prisma } from "@/lib/prisma";
import type { LocationRepository } from "@/core/ports/location.repository";
import type {
  CreateLocationRecordInput,
  GetLocationRecordsInput,
  UpdateLocationRecordInput,
} from "@/core/schema/location.schema";
import type {
  GetLocationRecordsResult,
  LocationModelWithImages,
} from "../../../prisma/types/location";
import type { Prisma } from "@prisma/client";

export class LocationRepositoryImpl implements LocationRepository {
  async findMany(query: GetLocationRecordsInput): Promise<GetLocationRecordsResult> {
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
    data: CreateLocationRecordInput,
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
    data: UpdateLocationRecordInput,
  ): Promise<LocationModelWithImages> {
    const { images, ...fields } = data;
    if (images === undefined) {
      return prisma.location.update({
        where: { id },
        data: fields,
        include: { images: true },
      });
    }

    return prisma.$transaction(async (transaction) => {
      await transaction.location.update({ where: { id }, data: fields });
      await transaction.locationImage.deleteMany({ where: { locationId: id } });
      await transaction.locationImage.createMany({
        data: images.map((image) => ({
          locationId: id,
          imageNumber: image.imageNumber,
          imageUrl: image.imageUrl,
        })),
      });
      return transaction.location.findUniqueOrThrow({
        where: { id },
        include: { images: true },
      });
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.location.delete({
      where: { id },
    });
  }

}
