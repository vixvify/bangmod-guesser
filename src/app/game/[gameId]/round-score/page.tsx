import { GameRoundScore } from "@/components/game/game-round-score";
import { mockGameRounds, mockRoundResult } from "@/_mock/_game";

export default async function RoundScorePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  return (
    <GameRoundScore
      gameId={gameId}
      result={mockRoundResult}
      totalRounds={mockGameRounds.length}
      accumulatedScore={mockGameRounds
        .filter((round) => round.round <= mockRoundResult.round)
        .reduce((total, round) => total + round.score, 0)}
    />
  );
}
