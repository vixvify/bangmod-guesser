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

    async function createGameWithRound(status: GameStatus) {
      return prisma.game.create({
        data: {
          userId,
          status,
          totalScore: 900,
          rounds: {
            create: {
              questionNumber: 1,
              locationId,
              imageNumber: 2,
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

    async function removeImage2() {
      return repository.update(locationId, {}, [
        {
          imageNumber: 1,
          imageUrl: "https://example.test/image-1.jpg",
        },
        {
          imageNumber: 3,
          imageUrl: "https://example.test/image-3.jpg",
        },
      ]);
    }

    it("prevents deleting an image used by a PLAYING game and rolls back other changes", async () => {
      await createGameWithRound(GameStatus.PLAYING);

      await expect(
        repository.update(
          locationId,
          { name: "Changed location name" },
          [
            {
              imageNumber: 1,
              imageUrl: "https://example.test/image-1.jpg",
            },
            {
              imageNumber: 3,
              imageUrl: "https://example.test/image-3.jpg",
            },
          ],
        ),
      ).rejects.toThrow("Cannot delete an image used by a game in progress");

      const location = await prisma.location.findUniqueOrThrow({
        where: { id: locationId },
        include: { images: { orderBy: { imageNumber: "asc" } } },
      });

      expect(location.name).toBe("Location test");
      expect(location.images.map((image) => image.imageNumber)).toEqual([1, 2, 3]);
    });

    it.each([GameStatus.COMPLETED, GameStatus.INCOMPLETE])(
      "sets the round imageNumber to null when deleting an image used by a %s game",
      async (status) => {
        const game = await createGameWithRound(status);

        await removeImage2();

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

    it("deletes an unused image without changing the remaining image numbers", async () => {
      await removeImage2();

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
  },
);