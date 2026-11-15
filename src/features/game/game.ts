import type { Location } from "../locations/location";

export type NewGameRound = { questionNumber: number; locationId: string; imageNumber: number };

export type SaveGameGuess = {
  gameId: string;
  userId: string;
  questionNumber: number;
  guessedLatitude: number | null;
  guessedLongitude: number | null;
  score: number;
  playTimeSeconds: number;
  finishedAt: Date;
  totalScore?: number;
};

export type CurrentGameRound = { questionNumber: number; imageUrl: string; deadlineAt: string | null };

export type GameSummaryResult = { baseScore: number; totalTimeSeconds: number; bonusScore: number; totalScore: number };

export type GameGuessResult = {
  guessedLatitude: number | null;
  guessedLongitude: number | null;
  distanceMeters: number | null;
  timedOut: boolean;
  score: number;
  accumulatedScore: number;
  imageUrl: string | null;
  location: { latitude: number; longitude: number; name: string; description: string | null };
};

export type GameExitResult = {
  id: string;
  status: "PLAYING" | "COMPLETED" | "INCOMPLETE";
  finishedAt: string | null;
};

export type GameRoundResult = {
  round: number;
  location: Pick<Location, "name" | "description" | "latitude" | "longitude"> & { images?: Location["images"] };
  guess: { latitude: number; longitude: number } | null;
  distanceMeters: number | null;
  score: number;
  elapsedSeconds?: number;
};

export type GameSummary = {
  rounds: GameRoundResult[];
  baseScore: number;
  bonusScore: number;
  totalScore: number;
  maxScore: number;
};
