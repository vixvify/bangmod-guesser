import { GameSession } from "@/features/game/components/game-session";
import { requireAuth } from "@/features/auth/lib/auth-check";

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  await requireAuth();

  return <GameSession key={gameId} gameId={gameId} />;
}

