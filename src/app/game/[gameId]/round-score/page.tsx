import { GameRoundScore } from "@/components/game/game-round-score";
import { mockGameRounds, mockRoundResult, mockRoundAccumulatedScore } from "@/_mock/_game";

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
      accumulatedScore={mockRoundAccumulatedScore}
    />
  );
}

