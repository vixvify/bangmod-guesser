import { GameSummary } from "@/features/game/components/game-summary";
import { requireAuth } from "@/features/auth/lib/auth-check";
import { mockGameSummary } from "@/features/game/mock/_game";

export default async function GameSummaryPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  await requireAuth();

  return <GameSummary gameId={gameId} summary={mockGameSummary} />;
}
