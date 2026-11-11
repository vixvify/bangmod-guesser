import type { GamePlayRecord } from "../../prisma/types/game";
export const gameNow = new Date("2026-11-10T01:00:00Z");
export function createGameRecord(): GamePlayRecord {
  return {
    id: "game-1", userId: "player-1", status: "PLAYING", startedAt: gameNow, finishedAt: null, totalScore: null,
    rounds: Array.from({ length: 5 }, (_, i) => ({
      gameId: "game-1", questionNumber: i + 1, locationId: `location-${i}`, imageNumber: 2,
      guessedLatitude: null, guessedLongitude: null, score: 0, playTimeSeconds: null,
      status: "PENDING", createdAt: gameNow, startedAt: null,
      locationImage: { locationId: `location-${i}`, imageNumber: 2, imageUrl: `https://example.test/image-${i}.webp`, createdAt: gameNow },
      location: { id: `location-${i}`, name: "Secret answer", description: "Secret description", latitude: 13.65, longitude: 100.49, status: "ACTIVE", createdAt: gameNow, updatedAt: gameNow },
    })),
  };
}
