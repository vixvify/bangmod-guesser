import { GameRoundScore } from "@/features/game/components/game-round-score";
import { requireAuth } from "@/features/auth/server/auth-check";
import { mockGameRounds, mockRoundResult, mockRoundAccumulatedScore } from "@/features/game/game.mock";

export default async function RoundScorePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  await requireAuth();

  return (
    <GameRoundScore
      gameId={gameId}
      result={mockRoundResult}
      totalRounds={mockGameRounds.length}
      accumulatedScore={mockRoundAccumulatedScore}
    />
  );
}

