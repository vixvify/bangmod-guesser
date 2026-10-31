export const dashboardNow = new Date("2026-10-27T05:00:00Z");
export const dashboardLocation = { id: "location-1", name: "Library", latitude: 13.6516, longitude: 100.4952 };
export const dashboardRound = {
  gameId: "game-1", questionNumber: 1, status: "COMPLETED" as const, score: 1000,
  playTimeSeconds: 12, guessedLatitude: dashboardLocation.latitude, guessedLongitude: dashboardLocation.longitude,
  location: dashboardLocation,
};
export const dashboardGame = {
  id: "game-1", user: { id: "user-1", name: "Player" }, status: "COMPLETED" as const,
  startedAt: new Date("2026-10-27T04:00:00Z"), finishedAt: new Date("2026-10-27T04:05:00Z"),
  totalScore: 1300, rounds: [dashboardRound],
};
