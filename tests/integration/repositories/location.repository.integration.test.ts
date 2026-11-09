import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GameStatus, RoundStatus } from "@prisma/client";

vi.mock("@/shared/lib/prisma", async () => {
  const { PrismaClient } = await import("@prisma/client");
  const { E2E_DATABASE_URL } = await import("../../../e2e/config");
  return { prisma: new PrismaClient({ datasourceUrl: E2E_DATABASE_URL }) };
});

import { prisma } from "@/shared/lib/prisma";
import { LocationRepositoryImpl } from "@/features/locations/server/location.repository";
import { LocationImagesChangedError, LocationImagesInUseError } from "@/features/locations/server/location.errors";

const repository = new LocationRepositoryImpl();

describe.skipIf(process.env.RUN_LOCATION_DATABASE_TESTS !== "1")(
  "LocationRepositoryImpl with real PostgreSQL",
  () => {
    let userId: string;
    let locationId: string;

    beforeEach(async () => {
      const suffix = randomUUID();

      userId = `location-test-user-${suffix}`;
      locationId = `location-test-${suffix}`;

      await prisma.user.create({
        data: {
          id: userId,
          name: "Location test",
          email: `${suffix}@example.test`,
        },
      });

      await prisma.location.create({
        data: {
          id: locationId,
          name: "Location test",
          latitude: 13.65,
          longitude: 100.49,
          images: {
            create: [
              { imageNumber: 1, imageUrl: "https://example.test/image-1.jpg" },
              { imageNumber: 2, imageUrl: "https://example.test/image-2.jpg" },
              { imageNumber: 3, imageUrl: "https://example.test/image-3.jpg" },
            ],
          },
        },
      });
    });

    afterEach(async () => {
      await prisma.user.deleteMany({ where: { id: userId } });
      await prisma.location.deleteMany({ where: { id: locationId } });
    });

    afterAll(async () => {
      await prisma.$disconnect();
    });

    async function createGameWithRound(
      status: GameStatus,
      imageNumber: number | null = 2,
    ) {
      return prisma.game.create({
        data: {
          userId,
          status,
          totalScore: 900,
          rounds: {
            create: {
              questionNumber: 1,
              locationId,
              imageNumber,
              status: RoundStatus.COMPLETED,
              score: 900,
              playTimeSeconds: 20,
              guessedLatitude: 13.7,
              guessedLongitude: 100.5,
            },
          },
        },
        include: { rounds: true },
      });
    }

    async function getImageSnapshot() {
      return prisma.locationImage.findMany({
        where: { locationId },
        select: {
          imageNumber: true,
          imageUrl: true,
        },
        orderBy: { imageNumber: "asc" },
      });
    }

    async function removeImage2() {
      const originalImages = await getImageSnapshot();

      return repository.update(locationId, {}, {
        images: [
          {
            imageNumber: 1,
            imageUrl: "https://example.test/image-1.jpg",
          },
          {
            imageNumber: 3,
            imageUrl: "https://example.test/image-3.jpg",
          },
        ],
        originalImages,
      });
    }

    async function replaceImage2() {
      const originalImages = await getImageSnapshot();

      return repository.update(locationId, {}, {
        images: [
          {
            imageNumber: 1,
            imageUrl: "https://example.test/image-1.jpg",
          },
          {
            imageNumber: 2,
            imageUrl: "https://example.test/replacement-image-2.jpg",
          },
          {
            imageNumber: 3,
            imageUrl: "https://example.test/image-3.jpg",
          },
        ],
        originalImages,
      });
    }

    it("returns IMAGE_IN_USE when deleting an image used by a PLAYING game", async () => {
      await createGameWithRound(GameStatus.PLAYING);

      const originalImages = await getImageSnapshot();
      await expect(repository.update(
        locationId,
        { name: "Changed location name" },
        {
          images: [
            {
              imageNumber: 1,
              imageUrl: "https://example.test/image-1.jpg",
            },
            {
              imageNumber: 3,
              imageUrl: "https://example.test/image-3.jpg",
            },
          ],
          originalImages,
        },
      )).rejects.toBeInstanceOf(LocationImagesInUseError);

      const location = await prisma.location.findUniqueOrThrow({
        where: { id: locationId },
        include: { images: { orderBy: { imageNumber: "asc" } } },
      });

      expect(location.name).toBe("Location test");
      expect(location.images.map((image) => image.imageNumber)).toEqual([1, 2, 3]);
    });

    it("returns IMAGE_IN_USE when replacing an image used by a PLAYING game", async () => {
      await createGameWithRound(GameStatus.PLAYING);

      await expect(replaceImage2()).rejects.toBeInstanceOf(LocationImagesInUseError);

      const location = await prisma.location.findUniqueOrThrow({
        where: { id: locationId },
        include: { images: { orderBy: { imageNumber: "asc" } } },
      });

      expect(
        location.images.find((image) => image.imageNumber === 2)?.imageUrl,
      ).toBe("https://example.test/image-2.jpg");

      const game = await prisma.game.findFirstOrThrow({
        where: { userId },
        include: { rounds: true },
      });

      expect(game.rounds[0].imageNumber).toBe(2);
    });

    it.each([GameStatus.COMPLETED, GameStatus.INCOMPLETE])(
      "sets the round imageNumber to null when deleting an image used by a %s game",
      async (status) => {
        const game = await createGameWithRound(status);

        const result = await removeImage2();

        expect(result.id).toBe(locationId);

        const updatedGame = await prisma.game.findUniqueOrThrow({
          where: { id: game.id },
          include: { rounds: true },
        });

        expect(updatedGame.status).toBe(status);
        expect(updatedGame.rounds).toHaveLength(1);
        expect(updatedGame.rounds[0]).toMatchObject({
          questionNumber: 1,
          locationId,
          imageNumber: null,
          status: RoundStatus.COMPLETED,
          score: 900,
          playTimeSeconds: 20,
          guessedLatitude: 13.7,
          guessedLongitude: 100.5,
        });

        const images = await prisma.locationImage.findMany({
          where: { locationId },
          orderBy: { imageNumber: "asc" },
        });

        expect(images.map((image) => image.imageNumber)).toEqual([1, 3]);
      },
    );

    it.each([GameStatus.COMPLETED, GameStatus.INCOMPLETE])(
      "sets the round imageNumber to null when replacing an image used by a %s game",
      async (status) => {
        const game = await createGameWithRound(status);

        const result = await replaceImage2();

        expect(result.id).toBe(locationId);

        const updatedGame = await prisma.game.findUniqueOrThrow({
          where: { id: game.id },
          include: { rounds: true },
        });

        expect(updatedGame.status).toBe(status);
        expect(updatedGame.rounds[0]).toMatchObject({
          questionNumber: 1,
          locationId,
          imageNumber: null,
          status: RoundStatus.COMPLETED,
          score: 900,
          playTimeSeconds: 20,
          guessedLatitude: 13.7,
          guessedLongitude: 100.5,
        });

        const images = await prisma.locationImage.findMany({
          where: { locationId },
          orderBy: { imageNumber: "asc" },
        });

        expect(images.map((image) => image.imageNumber)).toEqual([1, 2, 3]);
        expect(images.find((image) => image.imageNumber === 2)?.imageUrl).toBe(
          "https://example.test/replacement-image-2.jpg",
        );
      },
    );

    it("deletes an unused image without changing the remaining image numbers", async () => {
      const result = await removeImage2();

      expect(result.id).toBe(locationId);

      const images = await prisma.locationImage.findMany({
        where: { locationId },
        orderBy: { imageNumber: "asc" },
      });

      expect(images.map((image) => image.imageNumber)).toEqual([1, 3]);
      expect(images.map((image) => image.imageUrl)).toEqual([
        "https://example.test/image-1.jpg",
        "https://example.test/image-3.jpg",
      ]);
    });

    it("rejects a GameRound with a non-existent imageNumber", async () => {
      await expect(
        createGameWithRound(GameStatus.COMPLETED, 999),
      ).rejects.toMatchObject({
        code: "P2003",
      });

      const games = await prisma.game.findMany({
        where: { userId },
      });

      expect(games).toHaveLength(0);
    });

    it("allows a GameRound with a null imageNumber", async () => {
      const game = await createGameWithRound(
        GameStatus.COMPLETED,
        null,
      );

      expect(game.rounds).toHaveLength(1);
      expect(game.rounds[0].imageNumber).toBeNull();
    });

    it("rejects a concurrent image update when the original snapshot is stale", async () => {
      const originalImages = await getImageSnapshot();

      const firstUpdate = repository.update(locationId, {}, {
        images: [
          {
            imageNumber: 1,
            imageUrl: "https://example.test/image-1.jpg",
          },
          {
            imageNumber: 2,
            imageUrl: "https://example.test/first-replacement.jpg",
          },
          {
            imageNumber: 3,
            imageUrl: "https://example.test/image-3.jpg",
          },
        ],
        originalImages,
      });

      const secondUpdate = repository.update(locationId, {}, {
        images: [
          {
            imageNumber: 1,
            imageUrl: "https://example.test/image-1.jpg",
          },
          {
            imageNumber: 2,
            imageUrl: "https://example.test/second-replacement.jpg",
          },
          {
            imageNumber: 3,
            imageUrl: "https://example.test/image-3.jpg",
          },
        ],
        originalImages,
      });

      const results = await Promise.allSettled([firstUpdate, secondUpdate]);
      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      const rejected = results.find((result) => result.status === "rejected");
      expect(rejected?.status === "rejected" && rejected.reason).toBeInstanceOf(LocationImagesChangedError);

      const location = await prisma.location.findUniqueOrThrow({
        where: { id: locationId },
        include: { images: true },
      });

      const image2 = location.images.find(
        (image) => image.imageNumber === 2,
      );

      expect([
        "https://example.test/first-replacement.jpg",
        "https://example.test/second-replacement.jpg",
      ]).toContain(image2?.imageUrl);
    });
  },
);
