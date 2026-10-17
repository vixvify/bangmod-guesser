import { GameSummary } from "@/components/game/game-summary";
import { mockGameSummary } from "@/_mock/_game";

export default async function GameSummaryPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  return <GameSummary gameId={gameId} summary={mockGameSummary} />;
}
