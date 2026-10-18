import { GameSession } from "@/components/game/game-session";
import { requireAuth } from "@/lib/auth-check";

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  await requireAuth();

  return <GameSession key={gameId} gameId={gameId} />;
}

