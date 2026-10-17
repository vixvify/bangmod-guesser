import type { Location } from "./location";

export type GameRoundResult = {
  round: number;
  location: Location;
  guess: { latitude: number; longitude: number };
  distanceMeters: number;
  score: number;
  elapsedSeconds: number;
};

export type GameSummary = {
  rounds: GameRoundResult[];
  baseScore: number;
  bonusScore: number;
  totalScore: number;
  maxScore: number;
};
