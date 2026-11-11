import { GameSummaryScreen } from "@/features/game/components/game-summary-screen";
import { requireAuth } from "@/features/auth/server/auth-check";

export default async function GameSummaryPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  await requireAuth();

  return <GameSummaryScreen gameId={gameId} />;
}
