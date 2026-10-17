import type { GameRoundResult, GameSummary } from "@/core/domain/game";
import { mockLocations } from "./_locations";

export const mockGameRounds: GameRoundResult[] = [
  { score: 556, distanceMeters: 72, elapsedSeconds: 22 },
  { score: 555, distanceMeters: 67, elapsedSeconds: 21 },
  { score: 970, distanceMeters: 12, elapsedSeconds: 14 },
  { score: 990, distanceMeters: 4, elapsedSeconds: 12 },
  { score: 950, distanceMeters: 18, elapsedSeconds: 18 },
].map((result, index) => ({
  ...result,
  round: index + 1,
  location: {
    ...mockLocations[index],
    latitude: 13.6508 + index * 0.0005,
    longitude: 100.4938 + (index % 3) * 0.0007,
    description: `${mockLocations[index].name} เป็นหนึ่งในสถานที่ภายในมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี วิทยาเขตบางมด ที่นักศึกษาได้พบเจอในชีวิตประจำวัน ลองสังเกตอาคาร ทางเดิน และพื้นที่สีเขียวรอบ ๆ เพื่อจดจำสถานที่นี้ในการเล่นครั้งต่อไป`,
  },
  guess: {
    latitude: 13.6508 + index * 0.0005 - result.distanceMeters / 111_320,
    longitude: 100.4938 + (index % 3) * 0.0007,
  },
}));

export const mockRoundResult = mockGameRounds[1];

export const mockRoundAccumulatedScore = mockGameRounds
  .filter((round) => round.round <= mockRoundResult.round)
  .reduce((total, round) => total + round.score, 0);

const baseScore = mockGameRounds.reduce((sum, round) => sum + round.score, 0);
const bonusScore = 300;

export const mockGameSummary: GameSummary = {
  rounds: mockGameRounds,
  baseScore,
  bonusScore,
  totalScore: baseScore + bonusScore,
  maxScore: 5000,
};

